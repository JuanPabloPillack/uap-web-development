"use client";

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
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Counter Smart Contract</h2>
        <p className="mb-6 text-gray-600">
          Please connect your wallet to interact with the counter.
        </p>
        <button
          onClick={() => open()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold mb-6">Counter Smart Contract</h2>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Connected:</p>
        <p className="font-mono text-sm break-all">{address}</p>
        <button
          onClick={() => disconnect()}
          className="mt-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Disconnect
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">
          Current Counter Value: {counterValue?.toString() || "0"}
        </h3>
      </div>

      <button
        onClick={handleIncrement}
        disabled={isPending || isConfirming}
        className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors ${
          isPending || isConfirming ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isPending
          ? "Confirming..."
          : isConfirming
          ? "Waiting for confirmation..."
          : "Increment Counter"}
      </button>

      {hash && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Transaction Hash:</p>
          <p className="font-mono text-xs break-all">{hash}</p>
          {isConfirmed && (
            <p className="text-green-600 font-medium mt-2">
              Transaction confirmed!
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 rounded-lg">
          <p className="text-red-600">Error: {error.message}</p>
        </div>
      )}
    </div>
  );
}
