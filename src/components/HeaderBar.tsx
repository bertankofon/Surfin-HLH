


'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useAgentWallet } from '@/hooks/useAgentWallet';

type Props = {
  usd: number;
  setUsd: (v: number) => void;
  leverage: number;
  setLeverage: (v: number) => void;
  isCross: boolean;
  setIsCross: (v: boolean) => void;
};

export default function HeaderBar({ usd, setUsd, leverage, setLeverage, isCross, setIsCross }: Props) {
  const { address, isConnected } = useAccount();
  const { isApproved, approveAgent, isApproving } = useAgentWallet();
  const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Connect';

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="max-w-md mx-auto p-3 pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-900">{short}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/positions" className="text-sm text-blue-600 underline">Positions</Link>
            {!isApproved && isConnected && (
              <button
                type="button"
                onClick={approveAgent}
                disabled={isApproving}
                className="px-3 py-1.5 rounded bg-purple-600 text-white text-sm disabled:opacity-50"
              >
                {isApproving ? 'Enabling…' : 'Enable Trading'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 bg-white">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-700">USD Amount</label>
            <div className="text-xs font-semibold text-gray-900">${usd}</div>
          </div>
          <input type="range" min={10} max={100} step={10} value={usd} onChange={(e) => setUsd(Number(e.target.value))} className="w-full" />

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">Leverage</label>
                <div className="text-xs font-semibold text-gray-900">{leverage}x</div>
              </div>
              <input type="range" min={1} max={20} step={1} value={leverage} onChange={(e) => setLeverage(Math.max(1, Number(e.target.value || 1)))} className="w-full" />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCross(true)}
                className={`px-3 py-2 rounded text-sm ${isCross ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Cross
              </button>
              <button
                type="button"
                onClick={() => setIsCross(false)}
                className={`px-3 py-2 rounded text-sm ${!isCross ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Isolated
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}