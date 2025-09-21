// Hyperliquid'de mevcut coinler (testnet)
export const SUPPORTED_COINS = [
  { symbol: 'ETH', name: 'Ethereum', assetId: 0 },
  { symbol: 'BTC', name: 'Bitcoin', assetId: 1 },
  { symbol: 'SOL', name: 'Solana', assetId: 2 },
  { symbol: 'ARB', name: 'Arbitrum', assetId: 3 },
  { symbol: 'AVAX', name: 'Avalanche', assetId: 4 },
] as const;

// Order tipleri
export const ORDER_TYPES = {
  LIMIT: 'limit',
  MARKET: 'market', // IOC limit order olarak implement edilecek
} as const;

// Time in Force
export const TIME_IN_FORCE = {
  GTC: 'Gtc', // Good Till Cancel
  IOC: 'Ioc', // Immediate or Cancel (market orders için)
  ALO: 'Alo', // Add Liquidity Only
} as const;

// Order side
export const ORDER_SIDE = {
  BUY: true,
  SELL: false,
} as const;

// TypeScript types
export type Coin = typeof SUPPORTED_COINS[number];
export type OrderType = typeof ORDER_TYPES[keyof typeof ORDER_TYPES];
export type TimeInForce = typeof TIME_IN_FORCE[keyof typeof TIME_IN_FORCE];

// Position interface
export interface Position {
  coin: string;
  side: 'long' | 'short';
  size: string;
  entryPrice: string;
  markPrice: string;
  pnl: string;
  percentage: string;
}

// Order interface
export interface OrderRequest {
  coin: Coin;
  side: 'buy' | 'sell';
  size: string;
  price?: string; // market orders için optional
  orderType: OrderType;
  reduceOnly?: boolean;
}

// Builder config (env)
export const BUILDER_ADDRESS = (process.env.NEXT_PUBLIC_BUILDER_ADDRESS as `0x${string}` | undefined);
export const DEFAULT_BUILDER_FEE_TENTH_BPS = Number(process.env.NEXT_PUBLIC_BUILDER_FEE_TENTH_BPS ?? 10); // 10 = 1 bps = 0.01%