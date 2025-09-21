// src/hooks/useCoinInfo.ts
'use client';

import { useQuery } from '@tanstack/react-query';

const COINGECKO_IDS: Record<string, string> = {
  ETH: 'ethereum',
  BTC: 'bitcoin',
  SOL: 'solana',
  ARB: 'arbitrum',
  AVAX: 'avalanche-2',
};

export function useCoinInfo(symbol?: string) {
  const id = symbol ? COINGECKO_IDS[symbol] : undefined;

  const { data } = useQuery({
    queryKey: ['coingecko', 'markets', id],
    enabled: !!id,
    staleTime: 60_000,
    queryFn: async () => {
      if (!id) return null;
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load coin info');
      const arr = await res.json();
      return arr?.[0] ?? null;
    },
  });

  return {
    name: data?.name as string | undefined,
    image: data?.image as string | undefined,
    marketCap: (typeof data?.market_cap === 'number' ? data.market_cap : null) as number | null,
    rank: (typeof data?.market_cap_rank === 'number' ? data.market_cap_rank : null) as number | null,
    volumeUsd: (typeof data?.total_volume === 'number' ? data.total_volume : null) as number | null,
  };
}