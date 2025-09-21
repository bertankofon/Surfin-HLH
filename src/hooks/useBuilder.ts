// src/hooks/useBuilder.ts
'use client';

import { useEffect, useState } from 'react';
import { useHyperliquid } from './useHyperliquid';
import { infoClient } from '@/lib/hyperliquid';
import { BUILDER_ADDRESS, DEFAULT_BUILDER_FEE_TENTH_BPS } from '@/lib/constants';
import { tenthBpsToPercentString } from '@/lib/formatting';

export function useBuilder() {
  const { address, isConnected, exchangeClient } = useHyperliquid();
  const [approvedMaxTenthBps, setApprovedMaxTenthBps] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const builderAddress = BUILDER_ADDRESS;

  const canUseBuilder = isConnected && !!exchangeClient && !!builderAddress;

  const fetchApproval = async () => {
    if (!address || !builderAddress) return;
    setIsLoading(true);
    try {
      const max = await infoClient.maxBuilderFee({ user: address, builder: builderAddress });
      setApprovedMaxTenthBps(typeof max === 'number' ? max : 0);
    } catch {
      setApprovedMaxTenthBps(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApproval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, builderAddress]);

  const approveBuilderFee = async (tenthBps: number = DEFAULT_BUILDER_FEE_TENTH_BPS) => {
    if (!exchangeClient || !builderAddress) throw new Error('Wallet or builder missing');
    setIsApproving(true);
    try {
      const maxFeeRate = tenthBpsToPercentString(tenthBps); // e.g. "0.01%"
      console.log('[Builder] Approving max fee', { builder: builderAddress, maxFeeRate });
      const res = await exchangeClient.approveBuilderFee({ builder: builderAddress, maxFeeRate });
      console.log('[Builder] Approve result', res);
      await fetchApproval();
      return res;
    } finally {
      setIsApproving(false);
    }
  };

  const isApprovedFor = (tenthBps: number) => {
    if (approvedMaxTenthBps == null) return false;
    return approvedMaxTenthBps >= tenthBps;
  };

  return {
    builderAddress,
    approvedMaxTenthBps,
    isLoading,
    isApproving,
    approveBuilderFee,
    isApprovedFor,
    refresh: fetchApproval,
    canUseBuilder,
  };
}
