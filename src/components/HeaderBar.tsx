'use client';

import { useAccount } from 'wagmi';
import { useConnectModal, useAccountModal } from '@rainbow-me/rainbowkit';
import { useHeader } from '@/contexts/HeaderContext';
import Image from 'next/image';

type Props = {
  usd: number;
  setUsd: (v: number) => void;
  leverage: number;
  setLeverage: (v: number) => void;
  isCross: boolean;
  setIsCross: (v: boolean) => void;
  isApproved: boolean;
  isApproving: boolean;
  approveAgent: () => void;
  error?: string | null;
  clearError?: () => void;
  showSuccess?: boolean;
  clearSuccess?: () => void;
};

export default function HeaderBar({ usd, setUsd, leverage, setLeverage, isCross, setIsCross, isApproved, isApproving, approveAgent, error, clearError, showSuccess, clearSuccess }: Props) {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { isExpanded, setIsExpanded } = useHeader();

  const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Connect';
  const notional = usd * leverage;

  return (
    <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-blue-800/30">
      <div className="max-w-md mx-auto p-3">
        {/* Main Header - Always Visible */}
        <div className="flex items-center justify-between gap-3 mb-2">
          {/* Logo and App Name */}
          <div className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="Surfin Logo" 
              width={28} 
              height={28} 
              className="rounded-lg"
            />
            <Image 
              src="/image-removebg-preview (10).png" 
              alt="Surfin" 
              width={120} 
              height={32} 
              className="h-8 -ml-2"
            />
          </div>

          {/* Wallet & Trading Status */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => (isConnected ? openAccountModal?.() : openConnectModal?.())}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/20 text-white text-sm border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-blue-400'}`} />
              <span className="font-medium">{isConnected ? short : 'Connect'}</span>
            </button>

            {!isApproved && isConnected && (
              <button
                type="button"
                onClick={approveAgent}
                disabled={isApproving}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {isApproving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Riding...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span>🏄‍♂️</span>
                    <span>Start Surfing!</span>
                  </div>
                )}
              </button>
            )}

            {isApproved && isConnected && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                <span className="text-green-400 text-sm">🏄‍♀️</span>
                <span className="text-green-400 text-xs font-medium">Ready!</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex items-center justify-between text-xs text-blue-300 mb-2">
          <div className="flex items-center gap-4">
            <span>💰 ${usd}</span>
            <span>⚡ {leverage}x</span>
            <span>🌊 {isCross ? 'Cross' : 'Isolated'}</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-400 hover:text-white transition-colors"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Collapsible Controls */}
        {isExpanded && (
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30 shadow-lg mb-2">
            {/* USD per Swipe */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-blue-200 flex items-center gap-2">
                    <span>💰</span>
                    <span>USD per Swipe</span>
                  </label>
                </div>
                <div className="text-sm font-bold text-white bg-blue-600/20 px-3 py-1 rounded-full border border-blue-500/30">
                  ${usd}
                </div>
              </div>
              <input 
                type="range" 
                min={1} 
                max={100} 
                step={1} 
                value={usd} 
                onChange={(e) => setUsd(Number(e.target.value))} 
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${usd}%, #334155 ${usd}%, #334155 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-blue-300 mt-1">
                <span>Small</span>
                <span>🌊</span>
                <span>Tsunami</span>
              </div>
            </div>

            {/* Leverage */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-blue-200 flex items-center gap-2">
                    <span>⚡</span>
                    <span>Leverage</span>
                  </label>
                </div>
                <div className="text-sm font-bold text-white bg-cyan-600/20 px-3 py-1 rounded-full border border-cyan-500/30">
                  {leverage}x
                </div>
              </div>
              <input 
                type="range" 
                min={1} 
                max={20} 
                step={1} 
                value={leverage} 
                onChange={(e) => setLeverage(Math.max(1, Number(e.target.value || 1)))} 
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(leverage/20)*100}%, #334155 ${(leverage/20)*100}%, #334155 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-cyan-300 mt-1">
                <span>Gentle</span>
                <span>⚡</span>
                <span>Extreme</span>
              </div>
              <div className="text-lg font-bold text-white text-center mt-2 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 px-3 py-2 rounded-lg border border-cyan-500/30">
                ⚡ Total: ${Number(notional).toLocaleString()}
              </div>
            </div>

            {/* Mode */}
            <div>
              <div className="flex flex-col mb-2">
                <label className="text-sm font-bold text-blue-200 flex items-center gap-2">
                  <span>🏄‍♂️</span>
                  <span>Mode</span>
                </label>
                <span className="text-xs text-blue-400 mt-0.5">Cross: shared margin, Isolated: separate margin</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCross(true)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isCross ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600'}`}
                >
                  🌊 Cross
                </button>
                <button
                  type="button"
                  onClick={() => setIsCross(false)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${!isCross ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600'}`}
                >
                  🏄‍♀️ Isolated
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}