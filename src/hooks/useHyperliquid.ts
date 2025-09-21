'use client';

import { useMemo } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { createExchangeClient, infoClient } from '@/lib/hyperliquid';

export function useHyperliquid() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Exchange client (trading için - wallet gerekli)
  const exchangeClient = useMemo(() => {
    if (!walletClient || !isConnected) {
      return null;
    }
    
    try {
      return createExchangeClient(walletClient);
    } catch (error) {
      console.error('Failed to create exchange client:', error);
      return null;
    }
  }, [walletClient, isConnected]);

  // Info client (veri okuma için - her zaman kullanılabilir)
  const infoClientInstance = infoClient;

  return {
    // Wallet durumu
    address,
    isConnected,
    
    // Hyperliquid clients
    exchangeClient,     // Trading için (null if not connected)
    infoClient: infoClientInstance, // Market data için (always available)
    
    // Kullanışlı flag'ler
    canTrade: isConnected && exchangeClient !== null,
    isLoading: isConnected && !exchangeClient, // Bağlı ama client hazır değil
  };
}
