'use client';

import { useRef, useState, useMemo } from 'react';
import { useAsset24h } from '@/hooks/useAsset24h';
import { useCoinInfo } from '@/hooks/useCoinInfo';
import { useHeader } from '@/contexts/HeaderContext';
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
  const { isExpanded } = useHeader();

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false, startX: 0, startY: 0 });

  const handleStart = (x: number, y: number) => {
    setDrag({ x: 0, y: 0, active: true, startX: x, startY: y });
    // Sayfa scroll'unu engelle
    document.body.style.overflow = 'hidden';
  };

  const handleMove = (x: number, y: number) => {
    if (!drag.active) return;
    setDrag(p => ({ ...p, x: x - p.startX, y: y - p.startY }));
  };

  const handleEnd = () => {
    // Sayfa scroll'unu geri aç
    document.body.style.overflow = 'unset';
    
    const tx = 100, ty = 100;
    if (drag.y < -ty) {
      // Add ripple effect for pass
      createRippleEffect();
      onSwipe('up');
    } else if (drag.x > tx) {
      // Add wind and trail effects for long
      createRippleEffect();
      createWindEffect('right');
      createSurfTrail('right');
      onSwipe('right');
    } else if (drag.x < -tx) {
      // Add wind and trail effects for short
      createRippleEffect();
      createWindEffect('left');
      createSurfTrail('left');
      onSwipe('left');
    }
    setDrag({ x: 0, y: 0, active: false, startX: 0, startY: 0 });
  };

  const createRippleEffect = () => {
    if (cardRef.current) {
      const ripple = document.createElement('div');
      ripple.className = 'ripple';
      ripple.style.left = '50%';
      ripple.style.top = '50%';
      ripple.style.width = '20px';
      ripple.style.height = '20px';
      ripple.style.transform = 'translate(-50%, -50%)';
      cardRef.current.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
  };

  const createWindEffect = (direction: 'left' | 'right') => {
    if (cardRef.current) {
      const wind = document.createElement('div');
      wind.className = 'wind-flow';
      wind.style.position = 'absolute';
      wind.style.top = '0';
      wind.style.left = direction === 'left' ? '0' : 'auto';
      wind.style.right = direction === 'right' ? '0' : 'auto';
      wind.style.width = '100%';
      wind.style.height = '100%';
      wind.style.background = direction === 'left' 
        ? 'linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.3), transparent)'
        : 'linear-gradient(-90deg, transparent, rgba(6, 182, 212, 0.3), transparent)';
      wind.style.pointerEvents = 'none';
      wind.style.zIndex = '10';
      cardRef.current.appendChild(wind);
      
      setTimeout(() => {
        wind.remove();
      }, 800);
    }
  };

  const createSurfTrail = (direction: 'left' | 'right') => {
    if (cardRef.current) {
      const trail = document.createElement('div');
      trail.className = 'surf-trail';
      trail.style.position = 'absolute';
      trail.style.top = '50%';
      trail.style.left = direction === 'left' ? '0' : 'auto';
      trail.style.right = direction === 'right' ? '0' : 'auto';
      trail.style.width = '60px';
      trail.style.height = '4px';
      trail.style.background = direction === 'left'
        ? 'linear-gradient(90deg, rgba(14, 165, 233, 0.6), transparent)'
        : 'linear-gradient(-90deg, rgba(6, 182, 212, 0.6), transparent)';
      trail.style.borderRadius = '2px';
      trail.style.pointerEvents = 'none';
      trail.style.zIndex = '10';
      cardRef.current.appendChild(trail);
      
      setTimeout(() => {
        trail.remove();
      }, 600);
    }
  };

  // Placeholder mini sparkline path (kept in case we need it)
  const points = useMemo(() => {
    const arr = Array.from({ length: 20 }, (_, i) => 50 + Math.sin(i / 2) * 12);
    return arr.map((y, i) => `${(i / 19) * 280},${y}`).join(' ');
  }, []);

  const pctBadgeClass = typeof changePct === 'number'
    ? (changePct >= 0 ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30' : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30')
    : 'bg-slate-600/50 text-slate-400 ring-1 ring-slate-500/30';

  // Compact version when header is expanded
  if (isExpanded) {
    return (
      <div
        ref={cardRef}
        className={`w-[92vw] max-w-[320px] mx-auto bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg border border-blue-500/20 select-none touch-pan-y ${!drag.active ? 'surf-wave' : ''}`}
        style={{
          transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x * 0.05}deg)`,
          transition: drag.active ? 'none' : 'transform 180ms ease',
          boxShadow: drag.active 
            ? `0 0 12px rgba(14, 165, 233, 0.2)` 
            : '0 0 8px rgba(14, 165, 233, 0.1)',
        }}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => drag.active && handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={() => drag.active && handleEnd()}
        onTouchStart={(e) => { 
          e.preventDefault();
          const t = e.touches[0]; 
          if (t) handleStart(t.clientX, t.clientY); 
        }}
        onTouchMove={(e) => { 
          e.preventDefault();
          const t = e.touches[0]; 
          if (t) handleMove(t.clientX, t.clientY); 
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleEnd();
        }}
      >
        <div className="relative p-4">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-700/50 overflow-hidden flex items-center justify-center border border-blue-500/30">
                {image ? (
                  <img src={image} alt={symbol} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold text-blue-300">{symbol[0]}</span>
                )}
              </div>
              <div>
                <div className="text-lg font-bold text-white">{name ?? symbol}</div>
                <div className="text-xs text-blue-300">{symbol}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-semibold text-white">
                {price ? `$${Number(price).toLocaleString()}` : '-'}
              </div>
              <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {pctBadgeClass}">
                <span className={pctBadgeClass.replace(' ring-1', '')}>
                  {typeof changePct === 'number' ? `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Compact Chart */}
          <div className="mb-3">
            <MiniChart symbol={symbol} height={80} />
          </div>

          {/* Compact Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-xs font-semibold text-white">{formatCompactUsd(volumeUsd)}</div>
              <div className="text-[9px] text-blue-300">Vol</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-white">{formatCompactUsd(marketCap)}</div>
              <div className="text-[9px] text-blue-300">Cap</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-white">{rank ? `#${rank}` : '-'}</div>
              <div className="text-[9px] text-blue-300">Rank</div>
            </div>
          </div>

          {/* Swipe Indicators */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {drag.active && Math.abs(drag.x) > 20 && (
              <div className={`px-4 py-2 rounded-xl text-white text-sm font-bold shadow-md ${drag.x > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{drag.x > 0 ? '🏄‍♂️' : '🌊'}</span>
                  <span>{drag.x > 0 ? 'LONG!' : 'SHORT!'}</span>
                  <span className="text-lg">{drag.x > 0 ? '🌊' : '🏄‍♀️'}</span>
                </div>
              </div>
            )}
            {drag.active && drag.y < -40 && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 text-white text-sm font-bold shadow-md border border-slate-600">
                <div className="flex items-center gap-1">
                  <span className="text-lg">🏄‍♀️</span>
                  <span>PASS</span>
                  <span className="text-lg">🌊</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full version when header is collapsed
  return (
    <div
      ref={cardRef}
      className={`w-[92vw] max-w-[420px] mx-auto bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-lg border border-blue-500/20 select-none touch-pan-y ${!drag.active ? 'surf-wave' : ''}`}
      style={{
        transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x * 0.05}deg)`,
        transition: drag.active ? 'none' : 'transform 180ms ease',
        boxShadow: drag.active 
          ? `0 0 12px rgba(14, 165, 233, 0.2)` 
          : '0 0 8px rgba(14, 165, 233, 0.1)',
      }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => drag.active && handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={() => drag.active && handleEnd()}
      onTouchStart={(e) => { 
        e.preventDefault(); // Sayfa scroll'unu engelle
        const t = e.touches[0]; 
        if (t) handleStart(t.clientX, t.clientY); 
      }}
      onTouchMove={(e) => { 
        e.preventDefault(); // Sayfa scroll'unu engelle
        const t = e.touches[0]; 
        if (t) handleMove(t.clientX, t.clientY); 
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleEnd();
      }}
    >
      <div className="relative p-6 pb-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700/50 overflow-hidden flex items-center justify-center border border-blue-500/30">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={symbol} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-blue-300">{symbol[0]}</span>
              )}
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{name ?? symbol}</div>
              <div className="text-xs text-blue-300">{symbol}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-semibold text-white">
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
          <div className="text-sm font-semibold text-blue-200 mb-2">Price Chart (24h)</div>
          <MiniChart symbol={symbol} height={160} />
        </div>

        <div className="mt-5">
          <div className="text-sm font-semibold text-blue-200 mb-3">Token Stats</div>
          <div className="grid grid-cols-3 gap-3">
            <StatPill label="24h Vol" value={formatCompactUsd(volumeUsd)} />
            <StatPill label="Market Cap" value={formatCompactUsd(marketCap)} />
            <StatPill label="Rank" value={rank ? `#${rank}` : '-'} />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {drag.active && Math.abs(drag.x) > 20 && (
            <div className={`px-6 py-3 rounded-2xl text-white text-lg font-bold shadow-lg ${drag.x > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{drag.x > 0 ? '🏄‍♂️' : '🌊'}</span>
                <span>{drag.x > 0 ? 'RIDE THE WAVE!' : 'DIVE DEEP!'}</span>
                <span className="text-2xl">{drag.x > 0 ? '🌊' : '🏄‍♀️'}</span>
              </div>
            </div>
          )}
          {drag.active && drag.y < -40 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-800 text-white text-lg font-bold shadow-lg border border-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏄‍♀️</span>
                <span>SKIP THIS WAVE</span>
                <span className="text-2xl">🌊</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-700/50 ring-1 ring-blue-500/20 shadow-sm px-3 py-3 text-center border border-blue-500/10">
      <div className="text-base font-semibold text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-blue-300 mt-0.5">{label}</div>
    </div>
  );
}