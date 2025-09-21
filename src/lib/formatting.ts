// src/lib/formatting.ts
export function trimZeros(x: string) {
  return x.replace(/\.?0+$/, '');
}
// 5 significant figure + (6 - szDecimals) kuralı
export function formatPerpPx(px: number | string, szDecimals: number) {
  const v = Number(px);
  const sig = Number(v.toPrecision(5)); // ≤ 5 significant figure
  const maxDec = Math.max(0, 6 - szDecimals);
  const rounded = sig.toFixed(Math.min(maxDec, (sig.toString().split('.')[1]?.length ?? 0)));
  return trimZeros(rounded);
}
// lot size kuralı
export function formatSz(sz: number | string, szDecimals: number) {
  return trimZeros(Number(sz).toFixed(szDecimals));
}

// 1 tenth-of-bps = 0.001%. 10 -> 0.01%
export function tenthBpsToPercentString(f: number): `${string}%` {
  const pct = f / 1000;
  return `${trimZeros(pct.toFixed(4))}%`;
}

export function formatCompactUsd(n?: number | null) {
  if (n == null || !isFinite(n)) return '-';
  // Compact USD: $12.4M, $824B
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n).replace(/\s/g, '');
}