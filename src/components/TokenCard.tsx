'use client';

import { useRef, useState, useMemo } from 'react';
import { useAsset24h } from '@/hooks/useAsset24h';
import MiniChart from '@/components/MiniChart';

type Props = {
  symbol: string;
  name?: string;
  price?: string;
  onSwipe: (dir: 'left' | 'right' | 'up') => void;
};

export default function TokenCard({ symbol, name, price, onSwipe }: Props) {
  const { changePct } = useAsset24h(symbol);
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

  // Placeholder mini sparkline (basit çizgi; gerçek data istersek ayrı hook ile doldururuz)
  const points = useMemo(() => {
    const arr = Array.from({ length: 20 }, (_, i) => 50 + Math.sin(i / 2) * 12);
    return arr.map((y, i) => `${(i / 19) * 280},${y}`).join(' ');
  }, []);

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
      <div className="relative p-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-2xl font-bold text-gray-900">{symbol}</div>
            {name && <div className="text-sm text-gray-500">{name}</div>}
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-gray-900">${price ? Number(price).toLocaleString() : '-'}</div>
            <div className={`text-xs ${typeof changePct === 'number' ? (changePct >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}`}>
              {typeof changePct === 'number' ? `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}% 24h` : '—'}
            </div>
          </div>
        </div>

        <div className="my-2">
          <MiniChart symbol={symbol} height={132} />
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
