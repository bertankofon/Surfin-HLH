'use client';

import { useState } from 'react';
import TokenCard from './TokenCard';
import { useHeader } from '@/contexts/HeaderContext';
import { SUPPORTED_COINS, DEFAULT_BUILDER_FEE_TENTH_BPS } from '@/lib/constants';
import { useMarketData } from '@/hooks/useMarketData';
import { useHyperliquid } from '@/hooks/useHyperliquid';
import { useAgentWallet } from '@/hooks/useAgentWallet';
import { infoClient } from '@/lib/hyperliquid';
import { formatPerpPx, formatSz } from '@/lib/formatting';
import { useBuilder } from '@/hooks/useBuilder';

type Props = {
  usd: number;
  isCross: boolean;
  leverage: number;
};

export default function SwipeDeck({ usd, isCross, leverage }: Props) {
  const { isExpanded } = useHeader();
  const { prices } = useMarketData();
  const { canTrade, exchangeClient } = useHyperliquid();
  const { agentExchangeClient } = useAgentWallet();
  const { builderAddress, isApprovedFor, approveBuilderFee } = useBuilder();

  const [index, setIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const coins = SUPPORTED_COINS;
  const current = coins[index];
  const symbol = current?.symbol;
  const name = current?.name;
  const price = symbol ? (prices[symbol] || '0') : '0';
  const next = () => setIndex(i => (coins.length ? (i + 1) % coins.length : 0));

  const handleSwipe = async (dir: 'left' | 'right' | 'up') => {
    if (!symbol) return;
    if (dir === 'up') { next(); return; }
    if (!canTrade || !exchangeClient || !agentExchangeClient) {
      setBanner({ type: 'err', text: 'Connect wallet and enable trading' });
      return;
    }
    if (submitting) return;

    const side = dir === 'right' ? 'buy' : 'sell';
    try {
      setSubmitting(true);
      setBanner(null);

      const [meta] = await infoClient.metaAndAssetCtxs();
      const assetId = meta.universe.findIndex(u => u.name === symbol);
      if (assetId < 0) throw new Error(`Asset not found: ${symbol}`);
      const szDecimals = Number(meta.universe[assetId].szDecimals ?? 3);

      const book = await infoClient.l2Book({ coin: symbol });
      const [bids, asks] = book.levels;
      const topPx = side === 'buy' ? (asks?.[0]?.px ?? price) : (bids?.[0]?.px ?? price);
      const buf = side === 'buy' ? 1.0002 : 0.9998;
      const rawPx = (Number(topPx) * buf).toString();
      const px = formatPerpPx(rawPx, szDecimals);

      const notionalUsd = Number(usd) * Number(leverage || 1);
      const sizeFromUsd = notionalUsd / Number(px);
      if (!isFinite(sizeFromUsd) || sizeFromUsd <= 0) throw new Error('Invalid USD/price');
      const sz = formatSz(sizeFromUsd, szDecimals);

      const levClient = agentExchangeClient ?? exchangeClient;
      try {
        await levClient.updateLeverage({ asset: assetId, isCross, leverage: Number(leverage) });
      } catch (e) {}

      const order = { a: assetId, b: side === 'buy', p: px, s: sz, r: false, t: { limit: { tif: 'Ioc' } } };
      const actionArgs: any = { orders: [order], grouping: 'na' };
      if (builderAddress) {
        try {
          const fee = DEFAULT_BUILDER_FEE_TENTH_BPS;
          if (!isApprovedFor(fee)) await approveBuilderFee(fee);
          actionArgs.builder = { b: builderAddress, f: fee };
        } catch {}
      }

      const res = await agentExchangeClient.order(actionArgs);
      if (res.status === 'ok') {
        setBanner({ type: 'ok', text: `${symbol} ${side.toUpperCase()} submitted ($${notionalUsd})` });
        next();
      } else {
        throw new Error('Order failed');
      }
    } catch (e: any) {
      setBanner({ type: 'err', text: e?.message ?? 'Order error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setBanner(null), 2500);
    }
  };

  return (
    <div className={`w-full ${isExpanded ? 'min-h-[40vh] flex items-start justify-center pt-2' : 'min-h-[64vh] flex items-center justify-center'} p-4`}>
      <div className={`relative ${submitting ? 'pointer-events-none' : ''}`}>
        {current ? (
          <TokenCard symbol={symbol!} name={name} price={price} onSwipe={handleSwipe} />
        ) : (
          <div className="text-center text-blue-300">
            <div className="text-2xl font-semibold mb-2">🏄‍♀️ You've surfed all the waves!</div>
            <div className="text-sm">No more assets in deck</div>
            <div className="mt-4 text-xs text-blue-400">Come back later for more trading opportunities</div>
          </div>
        )}
        {banner && (
          <div className={`absolute left-1/2 -translate-x-1/2 ${isExpanded ? 'bottom-[-2rem]' : 'bottom-[-3rem]'} px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${banner.type === 'ok' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
            {banner.type === 'ok' ? '🏄‍♂️ ' : '🌊 '}{banner.text}
          </div>
        )}
      </div>
    </div>
  );
}