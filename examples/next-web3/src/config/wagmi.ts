import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { sepolia } from 'wagmi/chains'

// Get projectId from https://cloud.walletconnect.com
export const projectId = 'YOUR_PROJECT_ID'

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'Next.js Web3 Counter',
  description: 'A Next.js app to interact with Counter smart contract',
  url: 'http://localhost:3000', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Create wagmiConfig
const chains = [sepolia] as const
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})