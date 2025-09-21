import * as hl from '@nktkas/hyperliquid';

// MAINNET için HTTP transport
export const httpTransport = new hl.HttpTransport({
  isTestnet: false, // ✅ MAINNET kullan!
});

// MAINNET için WebSocket transport  
export const wsTransport = new hl.WebSocketTransport({
  url: 'wss://api.hyperliquid.xyz/ws', // Mainnet URL
});

// Info client (veri okuma için - wallet gerekmez)
export const infoClient = new hl.InfoClient({
  transport: httpTransport,
});

// Exchange client oluşturma fonksiyonu (wallet gerekli)
export const createExchangeClient = (wallet: any) => {
  return new hl.ExchangeClient({
    wallet,
    transport: httpTransport,
  });
};

// Subscription client (real-time data için)
export const subscriptionClient = new hl.SubscriptionClient({
  transport: wsTransport,
});

