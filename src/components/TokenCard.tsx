'use client';

import { useRef, useState, useMemo } from 'react';
import { useAsset24h } from '@/hooks/useAsset24h';
import { useCoinInfo } from '@/hooks/useCoinInfo';
import MiniChart from '@/components/MiniChart';
import { formatCompactUsd } from '@/lib/formatting';

type Props = {
  symbol: string;
  name?: string;
  price?: string;
  onSwipe: (dir: 'left' | 'right' | 'up') => void;
};

export default function TokenCard({ symbol, name, price, onSwipe }: Props) {
  const { changePct } = useAsset24h(symbol);
  const { image, marketCap, rank, volumeUsd } = useCoinInfo(symbol);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false, startX: 0, startY: 0 });

  const handleStart = (x: number, y: number) => setDrag({ x: 0, y: 0, active: true, startX: x, startY: y });
  const handleMove = (x: number, y: number) => setDrag(p => p.active ? ({ ...p, x: x - p.startX, y: y - p.startY }) : p);
  const handleEnd = () => {
    const tx = 100, ty = 100;
    if (drag.y < -ty) onSwipe('up');
    else if (drag.x > tx) onSwipe('right');
    else if (drag.x < -tx) onSwipe('left');
    setDrag({ x: 0, y: 0, active: false, startX: 0, startY: 0 });
  };

  // Placeholder mini sparkline path (kept in case we need it)
  const points = useMemo(() => {
    const arr = Array.from({ length: 20 }, (_, i) => 50 + Math.sin(i / 2) * 12);
    return arr.map((y, i) => `${(i / 19) * 280},${y}`).join(' ');
  }, []);

  const pctBadgeClass = typeof changePct === 'number'
    ? (changePct >= 0 ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200')
    : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200';

  return (
    <div
      ref={cardRef}
      className="w-[92vw] max-w-[420px] mx-auto bg-white rounded-3xl shadow-lg border border-gray-200 select-none touch-pan-y"
      style={{
        transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x * 0.05}deg)`,
        transition: drag.active ? 'none' : 'transform 180ms ease',
      }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => drag.active && handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={() => drag.active && handleEnd()}
      onTouchStart={(e) => { const t = e.touches[0]; if (t) handleStart(t.clientX, t.clientY); }}
      onTouchMove={(e) => { const t = e.touches[0]; if (t) handleMove(t.clientX, t.clientY); }}
      onTouchEnd={handleEnd}
    >
      <div className="relative p-6 pb-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={symbol} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-gray-700">{symbol[0]}</span>
              )}
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{name ?? symbol}</div>
              <div className="text-xs text-gray-500">{symbol}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-semibold text-gray-900">
              {price ? `$${Number(price).toLocaleString()}` : '-'}
            </div>
            <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap {pctBadgeClass}">
              <span className={pctBadgeClass.replace(' ring-1', '')}>
                {typeof changePct === 'number' ? `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%` : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-1">
          <div className="text-sm font-semibold text-gray-800 mb-2">Price Chart (24h)</div>
          <MiniChart symbol={symbol} height={160} />
        </div>

        <div className="mt-5">
          <div className="text-sm font-semibold text-gray-800 mb-3">Token Stats</div>
          <div className="grid grid-cols-3 gap-3">
            <StatPill label="24h Vol" value={formatCompactUsd(volumeUsd)} />
            <StatPill label="Market Cap" value={formatCompactUsd(marketCap)} />
            <StatPill label="Rank" value={rank ? `#${rank}` : '-'} />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {drag.active && Math.abs(drag.x) > 20 && (
            <div className={`px-3 py-1.5 rounded-full text-white text-sm font-semibold ${drag.x > 0 ? 'bg-green-600' : 'bg-red-600'}`}>
              {drag.x > 0 ? 'Long' : 'Short'}
            </div>
          )}
          {drag.active && drag.y < -40 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-gray-800 text-white text-sm font-semibold">
              Pass
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm px-3 py-3 text-center">
      <div className="text-base font-semibold text-gray-900">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}