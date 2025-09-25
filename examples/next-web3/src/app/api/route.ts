import { NextResponse } from "next/server";
import {
  createPublicClient,
  createWalletClient,
  http,
  verifyMessage,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const COUNTER_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const COUNTER_ABI = [
  {
    inputs: [],
    name: "inc",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "by",
        type: "uint256",
      },
    ],
    name: "incBy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "x",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const allowedWallets = ["0x50D4dA7C55B5A6ffdf7f70596428A4D8A1Dd495c"];

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const privateKey = process.env.SEPOLIA_PRIVATE_KEY;
if (!privateKey) {
  throw new Error("SEPOLIA_PRIVATE_KEY environment variable is not set");
}

// Ensure private key is in correct format (starts with 0x)
const formattedPrivateKey = privateKey.startsWith("0x")
  ? (privateKey as `0x${string}`)
  : (`0x${privateKey}` as `0x${string}`);

const account = privateKeyToAccount(formattedPrivateKey);

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(),
});

const SIGNING_MESSAGE = "Please sign this message to confirm your identity.";

const generateMessage = (walletAddress: string) =>
  `${SIGNING_MESSAGE}\n\nWallet Address: ${walletAddress}\n\nTimestamp: ${new Date().toISOString()}\n\nNonce: ${Math.floor(
    Math.random() * 1000000
  )}`;

const messageMap = new Map<string, string>();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const walletAddress = url.searchParams.get("walletAddress");

  if (!walletAddress) {
    return NextResponse.json(
      { success: false, error: "Missing walletAddress parameter" },
      { status: 400 }
    );
  }

  if (messageMap.has(walletAddress)) {
    const existingMessage = messageMap.get(walletAddress)!;
    return NextResponse.json({ success: true, message: existingMessage });
  }

  const message = generateMessage(walletAddress);
  messageMap.set(walletAddress, message);

  try {
    const counterValue = await publicClient.readContract({
      address: COUNTER_CONTRACT_ADDRESS as `0x${string}`,
      abi: COUNTER_ABI,
      functionName: "x",
    });

    return NextResponse.json({
      success: true,
      message: message,
      count: Number(counterValue.toString()),
      contractAddress: COUNTER_CONTRACT_ADDRESS,
    });
  } catch (error) {
    console.error("Error reading contract:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to read contract",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { walletAddress, signature } = await request.json();

    // Validate required fields
    if (!walletAddress || !signature) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: walletAddress, signature, and message are required",
        },
        { status: 400 }
      );
    }

    // Check if wallet is in allowed list
    if (!allowedWallets.includes(walletAddress)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized wallet address" },
        { status: 403 }
      );
    }

    const message = messageMap.get(walletAddress);
    if (!message) {
      return NextResponse.json(
        { success: false, error: "No message found for this wallet address" },
        { status: 400 }
      );
    }

    // Verify the signature
    try {
      const isValid = await verifyMessage({
        address: walletAddress as `0x${string}`,
        message: message,
        signature: signature as `0x${string}`,
      });

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid signature" },
          { status: 401 }
        );
      }

      // Signature is valid, remove the message to prevent replay attacks
      messageMap.delete(walletAddress);
    } catch (signatureError) {
      console.error("Signature verification error:", signatureError);
      return NextResponse.json(
        { success: false, error: "Signature verification failed" },
        { status: 401 }
      );
    }

    const hash = await walletClient.writeContract({
      address: COUNTER_CONTRACT_ADDRESS as `0x${string}`,
      abi: COUNTER_ABI,
      functionName: "incBy",
      args: [5n], // Increment by 5
    });

    // Wait for transaction confirmation
    await publicClient.waitForTransactionReceipt({ hash });

    // Get the updated counter value
    const counterValue = await publicClient.readContract({
      address: COUNTER_CONTRACT_ADDRESS as `0x${string}`,
      abi: COUNTER_ABI,
      functionName: "x",
    });

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      newCount: Number(counterValue.toString()),
      incrementedBy: 5,
      contractAddress: COUNTER_CONTRACT_ADDRESS,
    });
  } catch (error) {
    console.error("Error incrementing counter:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to increment counter",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
