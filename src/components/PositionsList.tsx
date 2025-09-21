'use client';

import { useState } from 'react';
import { usePositions } from '@/hooks/usePositions';
import { useAgentWallet } from '@/hooks/useAgentWallet';
import { infoClient } from '@/lib/hyperliquid';
import { formatPerpPx, formatSz, tenthBpsToPercentString } from '@/lib/formatting';
import { useBuilder } from '@/hooks/useBuilder';
import { DEFAULT_BUILDER_FEE_TENTH_BPS } from '@/lib/constants';

type CloseState = 'idle' | 'loading' | 'success' | 'error';

export default function PositionsList() {
  const { positions, balance, summary, isLoading, error, hasPositions, hasData } = usePositions();
  const { agentExchangeClient } = useAgentWallet();
  const [closing, setClosing] = useState<Record<string, CloseState>>({});

  // Builder (close için auto-approve)
  const { builderAddress, isApprovedFor, approveBuilderFee, isApproving } = useBuilder();
  const requiredFee = DEFAULT_BUILDER_FEE_TENTH_BPS;

  const setCloseStatus = (coin: string, status: CloseState) => {
    setClosing(prev => ({ ...prev, [coin]: status }));
  };

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-red-500/30 p-6 shadow-lg">
        <h2 className="text-xl font-bold text-red-400 mb-2">🌊 Positions Error</h2>
        <p className="text-red-300 text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-blue-500/20 p-6 shadow-lg ocean-glow">
      <h2 className="text-xl font-bold text-white mb-4">🏄‍♂️ Your Positions</h2>

      {isLoading && (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-600 rounded w-1/4 mb-2"></div>
            <div className="h-20 bg-slate-700 rounded"></div>
          </div>
        </div>
      )}

      {hasData && balance && (
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-700/50 rounded-xl border border-blue-500/20">
          <div className="text-center">
            <p className="text-sm text-blue-300">Total Value</p>
            <p className="font-bold text-lg text-white">
              ${parseFloat(balance.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-blue-300">Available</p>
            <p className="font-bold text-lg text-green-400">
              ${parseFloat(balance.used).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-blue-300">Total PnL</p>
            <p className={`font-bold text-lg ${parseFloat(summary.totalPnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(summary.totalPnl) >= 0 ? '+' : ''}
              ${parseFloat(summary.totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {hasData && !hasPositions && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center border border-blue-500/30">
            <span className="text-blue-300 text-2xl">🏄‍♀️</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Open Positions</h3>
          <p className="text-blue-300">Start surfing the waves of DeFi!</p>
        </div>
      )}

      {hasPositions && (
        <div className="space-y-3">
          {positions.map((position, index) => {
            const pnl = parseFloat(position.pnl);
            const percentage = parseFloat(position.percentage);
            const isProfitable = pnl >= 0;
            const symbol = (position as any)?.rawPosition?.position?.coin as string;
            const state = closing[symbol] ?? 'idle';
            const isClosing = state === 'loading';
            const isClosed = state === 'success';
            const isError = state === 'error';

            return (
              <div
                key={index}
                className="border border-blue-500/20 rounded-xl p-4 bg-slate-700/30 hover:border-blue-400/40 transition-colors shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${position.side === 'long' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <div>
                      <h3 className="font-bold text-white">{position.coin}</h3>
                      <p className="text-sm text-blue-300 capitalize">{position.side}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-bold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                      {isProfitable ? '+' : ''}${pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-sm ${isProfitable ? 'text-green-300' : 'text-red-300'}`}>
                      {isProfitable ? '+' : ''}{percentage.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-blue-300">Size</p>
                    <p className="font-medium text-white">{parseFloat(position.size).toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-blue-300">Entry Price</p>
                    <p className="font-medium text-white">${parseFloat(position.entryPrice).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-blue-300">Mark Price</p>
                    <p className="font-medium text-white">${parseFloat(position.markPrice).toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-blue-500/20">
                  <button
                    className="w-full py-2 text-sm border border-cyan-500/50 rounded-lg text-cyan-300 hover:bg-cyan-500/20 transition-colors disabled:opacity-50 font-medium"
                    disabled={!agentExchangeClient || isClosing || isApproving}
                    onClick={async () => {
                      if (!agentExchangeClient) return;
                      if (!symbol) return;

                      try {
                        setCloseStatus(symbol, 'loading');
                        console.log('[Close] Start', { coin: symbol });

                        // Ensure builder approval before close
                        if (builderAddress && !isApprovedFor(requiredFee)) {
                          console.log('[Close] Builder not approved, approving now...', { builderAddress, requiredFee });
                          await approveBuilderFee(requiredFee);
                        }

                        const [meta] = await infoClient.metaAndAssetCtxs();
                        const assetId = meta.universe.findIndex(u => u.name === symbol);
                        if (assetId < 0) throw new Error('Asset not in universe: ' + symbol);

                        const szDecimals = Number(meta.universe[assetId].szDecimals ?? 3);
                        const isBuy = position.side === 'short';

                        const book = await infoClient.l2Book({ coin: symbol });
                        const [bids, asks] = book.levels;
                        let rawPx = isBuy ? (asks?.[0]?.px ?? position.markPrice) : (bids?.[0]?.px ?? position.markPrice);
                        rawPx = (Number(rawPx) * (isBuy ? 1.0002 : 0.9998)).toString();

                        const px = formatPerpPx(rawPx, szDecimals);
                        const sz = formatSz(position.size, szDecimals);

                        const order = { a: assetId, b: isBuy, p: px, s: sz, r: true, t: { limit: { tif: 'Ioc' } } };

                        const actionArgs: any = { orders: [order], grouping: 'na' };
                        if (builderAddress) {
                          actionArgs.builder = { b: builderAddress, f: requiredFee };
                        }

                        console.log('[Close] Payload', actionArgs);
                        const result = await agentExchangeClient.order(actionArgs);

                        console.log('[Close] Order response', result);
                        setCloseStatus(symbol, 'success');
                        setTimeout(() => setCloseStatus(symbol, 'idle'), 2000);
                      } catch (e) {
                        console.error('Close position failed:', e);
                        setCloseStatus(symbol, 'error');
                        setTimeout(() => setCloseStatus(symbol, 'idle'), 2500);
                      }
                    }}
                  >
                    {isClosing ? 'Closing...' : isApproving ? 'Approving...' : 'Close Position'}
                  </button>

                  {isError && (
                    <p className="mt-2 text-xs text-red-400">🌊 Close failed</p>
                  )}
                  {isClosed && (
                    <p className="mt-2 text-xs text-green-400">🏄‍♂️ Position closed</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasPositions && (
        <div className="mt-6 pt-4 border-t border-blue-500/20">
          <div className="flex justify-between text-sm text-blue-300">
            <span>🏄‍♂️ Open Positions: {summary.openPositions}</span>
            <span>Long: {summary.longPositions} | Short: {summary.shortPositions}</span>
          </div>
        </div>
      )}
    </div>
  );
}