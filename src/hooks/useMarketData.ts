'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { infoClient } from '@/lib/hyperliquid';
import { SUPPORTED_COINS } from '@/lib/constants';

export function useMarketData() {
  // Tüm mid fiyatları çek (React Query ile)
  const { data: allMids, isLoading, error, refetch } = useQuery({
    queryKey: ['market-data', 'all-mids'],
    queryFn: async () => {
      return await infoClient.allMids();
    },
    refetchInterval: 5000, // 5 saniyede bir güncelle
    staleTime: 2000,       // 2 saniye fresh tut
  });

  // Meta bilgileri çek (coin listesi, asset contexts)
  const { data: metaData } = useQuery({
    queryKey: ['market-data', 'meta'],
    queryFn: async () => {
      return await infoClient.metaAndAssetCtxs();
    },
    staleTime: 60000, // 1 dakika fresh tut (meta data az değişir)
  });

  // Fiyat verilerini işle ve formatla
  const formattedPrices = useMemo(() => {
    if (!allMids) return {};
    
    const priceMap: Record<string, string> = {};
    
    // API response object formatında geliyor
    SUPPORTED_COINS.forEach((coin) => {
      if (allMids[coin.symbol]) {
        priceMap[coin.symbol] = allMids[coin.symbol];
      }
    });
    
    return priceMap;
  }, [allMids]);

  // Specific coin fiyatı al
  const getCoinPrice = (symbol: string): string | null => {
    return formattedPrices[symbol] || null;
  };

  // Manuel refresh
  const refreshPrices = () => {
    refetch();
  };

  return {
    // Raw data
    allMids,
    metaData,
    
    // Formatted data  
    prices: formattedPrices, // { ETH: "3000", BTC: "45000" }
    
    // Utilities
    getCoinPrice,
    refreshPrices,
    
    // States
    isLoading,
    error,
    hasData: !!allMids,
  };
}
