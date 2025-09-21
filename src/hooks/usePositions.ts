'use client';

import { useQuery } from '@tanstack/react-query';
import { useHyperliquid } from './useHyperliquid';
import { SUPPORTED_COINS } from '@/lib/constants';
import { useMemo } from 'react';

export function usePositions() {
  const { address, isConnected, infoClient } = useHyperliquid();

  // Kullanıcının clearinghouse state'ini çek (bakiye, pozisyonlar)
  const { data: clearinghouseState, isLoading: isLoadingState, error } = useQuery({
    queryKey: ['positions', 'clearinghouse-state', address],
    queryFn: async () => {
      if (!address) throw new Error('No address');
      return await infoClient.clearinghouseState({ user: address });
    },
    enabled: !!address && isConnected,
    refetchInterval: 10000, // 10 saniyede bir güncelle
    staleTime: 5000,        // 5 saniye fresh tut
  });

  // Açık orderları çek
  const { data: openOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['positions', 'open-orders', address],
    queryFn: async () => {
      if (!address) throw new Error('No address');
      return await infoClient.openOrders({ user: address });
    },
    enabled: !!address && isConnected,
    refetchInterval: 5000, // 5 saniyede bir güncelle
    staleTime: 2000,
  });

  // Pozisyonları formatla
  const positions = useMemo(() => {
    if (!clearinghouseState?.assetPositions) return [];
    
    return clearinghouseState.assetPositions
      .filter(position => {
        // Sadece 0'dan büyük pozisyonları göster
        const size = parseFloat(position.position.szi);
        return Math.abs(size) > 0.001;
      })
      .map(position => {
        const coinSymbol = position.position.coin;        // <-- symbol, sayı değil
        const size = parseFloat(position.position.szi);
        const entryPrice = parseFloat(position.position.entryPx || '0');
        const unrealizedPnl = parseFloat(position.position.unrealizedPnl);
        const percentage = parseFloat(position.position.returnOnEquity) * 100;

        return {
          coin: coinSymbol,                                // <-- doğrudan symbol
          side: size > 0 ? 'long' : 'short',
          size: Math.abs(size).toString(),
          entryPrice: entryPrice.toString(),
          markPrice: position.position.positionValue || '0',
          pnl: unrealizedPnl.toString(),
          percentage: percentage.toString(),
          rawPosition: position,                           // <-- close için kullanacağız
        };
      });
  }, [clearinghouseState]);

  // Bakiye bilgileri
  const balance = useMemo(() => {
    if (!clearinghouseState) return null;
    
    return {
      total: clearinghouseState.marginSummary.accountValue || '0',
      available: clearinghouseState.marginSummary.totalMarginUsed || '0',
      used: clearinghouseState.withdrawable || '0',
    };
  }, [clearinghouseState]);

  // Pozisyon özeti
  const summary = useMemo(() => {
    const totalPnl = positions.reduce((sum, pos) => sum + parseFloat(pos.pnl), 0);
    const openPositions = positions.length;
    const longPositions = positions.filter(p => p.side === 'long').length;
    const shortPositions = positions.filter(p => p.side === 'short').length;

    return {
      totalPnl: totalPnl.toString(),
      openPositions,
      longPositions,
      shortPositions,
    };
  }, [positions]);

  return {
    // Raw data
    clearinghouseState,
    openOrders,
    
    // Processed data
    positions,
    balance,
    summary,
    
    // States
    isLoading: isLoadingState || isLoadingOrders,
    error,
    hasPositions: positions.length > 0,
    hasOrders: openOrders?.length > 0,
    
    // Helpers
    getPosition: (coinSymbol: string) => 
      positions.find(p => p.coin === coinSymbol),
    
    hasData: !!clearinghouseState,
  };
}
