import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useDisconnect,
} from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { sepolia } from "wagmi/chains";

const COUNTER_CONTRACT_ADDRESS = "0xf787f643a456914784F068823b9d5E9a60CEf764"; // Replace with your deployed contract address

const COUNTER_ABI = [
  {
    inputs: [],
    name: "inc",
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

export function Counter() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: counterValue, refetch } = useReadContract({
    address: COUNTER_CONTRACT_ADDRESS as `0x${string}`,
    abi: COUNTER_ABI,
    functionName: "x",
    chainId: sepolia.id,
  });

  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirmed) {
      refetch();
    }
  }, [isConfirmed, refetch]);

  const handleIncrement = () => {
    writeContract({
      address: COUNTER_CONTRACT_ADDRESS as `0x${string}`,
      abi: COUNTER_ABI,
      functionName: "inc",
      chainId: sepolia.id,
    });
  };

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2>Counter Smart Contract</h2>
        <p>Please connect your wallet to interact with the counter.</p>
        <button
          onClick={() => open()}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Counter Smart Contract</h2>
      <div style={{ marginBottom: "20px" }}>
        <p>Connected: {address}</p>
        <button
          onClick={() => disconnect()}
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginLeft: "10px",
          }}
        >
          Disconnect
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Current Counter Value: {counterValue?.toString() || "0"}</h3>
      </div>

      <button
        onClick={handleIncrement}
        disabled={isPending || isConfirming}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: isPending || isConfirming ? "not-allowed" : "pointer",
          opacity: isPending || isConfirming ? 0.6 : 1,
        }}
      >
        {isPending
          ? "Confirming..."
          : isConfirming
          ? "Waiting for confirmation..."
          : "Increment Counter"}
      </button>

      {hash && (
        <div style={{ marginTop: "20px" }}>
          <p>Transaction Hash: {hash}</p>
          {isConfirmed && (
            <p style={{ color: "green" }}>Transaction confirmed!</p>
          )}
        </div>
      )}

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <p>Error: {error.message}</p>
        </div>
      )}
    </div>
  );
}
