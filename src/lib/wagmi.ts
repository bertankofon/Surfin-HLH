import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum } from 'viem/chains'; // Sadece mainnet

export const config = getDefaultConfig({
  appName: 'Hyperliquid Trading App',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo-project-id',
  chains: [arbitrum], // Sadece Arbitrum mainnet
  ssr: true,
});
