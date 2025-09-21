// src/hooks/useAsset24h.ts
'use client';

import { useEffect, useState } from 'react';
import { infoClient } from '@/lib/hyperliquid';

export function useAsset24h(symbol?: string) {
  const [changePct, setChangePct] = useState<number | null>(null);
  const [volume, setVolume] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const now = Date.now();
        const startTime = now - 24 * 60 * 60 * 1000;
        const candles = await infoClient.candleSnapshot({ coin: symbol, interval: '1h', startTime });
        if (!mounted) return;
        if (candles.length > 0) {
          const first = candles[0];
          const last = candles[candles.length - 1];
          const open = Number((first as any).o ?? (first as any).open ?? 0);
          const close = Number((last as any).c ?? (last as any).close ?? 0);
          const vol = candles.reduce((sum: number, c: any) => sum + Number(c.v ?? c.volume ?? 0), 0);
          const pct = open > 0 ? ((close - open) / open) * 100 : 0;
          setChangePct(pct);
          setVolume(vol);
        } else {
          setChangePct(0);
          setVolume(0);
        }
      } catch {
        setChangePct(null);
        setVolume(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 60_000); // 1dk'da bir güncelle
    return () => { mounted = false; clearInterval(id); };
  }, [symbol]);

  return { changePct, volume, loading };
}