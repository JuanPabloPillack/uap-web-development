"use client";

import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useQuery } from "@tanstack/react-query";

export function SignatureGenerator() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { signMessage, data: signature, error, isPending } = useSignMessage();
  // const [message, setMessage] = useState("Increment counter by 5");
  const { data: message } = useQuery({
    queryKey: ["message", address],
    enabled: !!address,
    queryFn: async () => {
      const response = await fetch("/api?walletAddress=" + address);
      const data = await response.json();
      return data.message;
    },
  });

  const handleSign = () => {
    if (message) {
      signMessage({ message });
    }
  };

  const getJsonOutput = () => {
    if (!address || !signature) return null;

    return {
      walletAddress: address,
      message: message,
      signature: signature,
    };
  };

  if (!isConnected) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">Signature Generator</h3>
        <p className="text-gray-600 mb-4">
          Connect your wallet to generate a signature for the API.
        </p>
        <button
          onClick={() => open()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Signature Generator</h3>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-1">Connected Wallet:</p>
        <p className="font-mono text-sm break-all bg-gray-50 p-2 rounded">
          {address}
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message to Sign:
        </label>
        <pre>{message || "Loading message..."}</pre>
      </div>

      <div className="mb-4">
        <button
          onClick={handleSign}
          disabled={isPending || !message}
          className={`bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors ${
            isPending || !message ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isPending ? "Signing..." : "Sign Message"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded">
          <p className="text-red-600 text-sm">Error: {error.message}</p>
        </div>
      )}

      {signature && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Generated Signature:
            </p>
            <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded">
              {signature}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              JSON for API Endpoint:
            </p>
            <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(getJsonOutput(), null, 2)}
            </pre>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              cURL Example:
            </p>
            <pre className="bg-gray-800 text-white p-3 rounded text-xs overflow-x-auto">
              {`curl -X POST http://localhost:3000/api \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(getJsonOutput())}'`}
            </pre>
          </div>

          <button
            onClick={() =>
              navigator.clipboard.writeText(
                JSON.stringify(getJsonOutput(), null, 2)
              )
            }
            className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Copy JSON to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}
