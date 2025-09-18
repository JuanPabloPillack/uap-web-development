# Web3 Counter DApp Setup

This React application allows you to connect MetaMask and interact with a Counter smart contract on Sepolia testnet.

## Setup Instructions

### 1. Get a WalletConnect Project ID
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create a new project
3. Copy your Project ID
4. Update `src/config/wagmi.ts` and replace `'YOUR_PROJECT_ID'` with your actual project ID

### 2. Deploy the Counter Contract
1. Deploy the Counter contract (from `../web3/contracts/Counter.sol`) to Sepolia testnet
2. Copy the deployed contract address
3. Update `src/components/Counter.tsx` and replace `'0x...'` with your contract address

### 3. Install Dependencies and Run
```bash
yarn install
yarn dev
```

## Features

- **Wallet Connection**: Connect/disconnect MetaMask wallet using Web3Modal
- **Contract Interaction**: Call the `inc()` function on your Counter smart contract
- **Real-time Updates**: Automatically refreshes counter value after transactions
- **Transaction Tracking**: Shows transaction hash and confirmation status

## Usage

1. Click "Connect Wallet" to connect your MetaMask
2. Make sure you're on Sepolia testnet
3. Click "Increment Counter" to call the smart contract
4. Confirm the transaction in MetaMask
5. Watch the counter value update automatically

## Contract ABI

The component uses a minimal ABI that includes:
- `inc()`: Increments the counter by 1
- `x()`: Returns the current counter value

Make sure your deployed contract matches the Counter.sol interface.