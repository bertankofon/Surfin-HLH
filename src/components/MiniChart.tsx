'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, LineStyle } from 'lightweight-charts';
import { infoClient } from '@/lib/hyperliquid';

type Props = {
  symbol: string;
  height?: number;
};

export default function MiniChart({ symbol, height = 100 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const chart = createChart(ref.current, {
      height,
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#6b7280' },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      grid: {
        horzLines: { visible: false, color: '#efefef', style: LineStyle.Dotted },
        vertLines: { visible: false, color: '#efefef', style: LineStyle.Dotted },
      },
      timeScale: { visible: false, borderVisible: false },
      handleScroll: false,
      handleScale: false,
    });

    const series = chart.addAreaSeries({
      lineColor: '#3b82f6',
      topColor: 'rgba(59, 130, 246, 0.25)',
      bottomColor: 'rgba(59, 130, 246, 0.00)',
      priceLineVisible: false,
    });

    let mounted = true;
    const load = async () => {
      const now = Date.now();
      const startTime = now - 24 * 60 * 60 * 1000;
      const candles: any[] = await infoClient.candleSnapshot({ coin: symbol, interval: '5m', startTime });
      if (!mounted) return;
      const data = candles.map((c: any) => ({
        time: Math.floor((c.t ?? c.time) / 1000),
        value: Number(c.c ?? c.close),
      }));
      series.setData(data as any);
      chart.timeScale().fitContent();
    };
    load();
    const id = setInterval(load, 60_000);

    const ro = new ResizeObserver(() => {
      if (!ref.current) return;
      chart.applyOptions({ width: ref.current.clientWidth });
      chart.timeScale().fitContent();
    });
    ro.observe(ref.current);

    return () => {
      mounted = false;
      clearInterval(id);
      ro.disconnect();
      chart.remove();
    };
  }, [symbol, height]);

  return <div ref={ref} className="w-full" />;
}
