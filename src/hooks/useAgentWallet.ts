'use client';

import { useState, useEffect } from 'react';
import { useHyperliquid } from './useHyperliquid';
import { createExchangeClient } from '@/lib/hyperliquid';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

export function useAgentWallet() {
  const { address, isConnected, exchangeClient } = useHyperliquid();
  const [agentWallet, setAgentWallet] = useState<any>(null);
  const [agentExchangeClient, setAgentExchangeClient] = useState<any>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // LocalStorage'dan agent wallet'ı yükle
  useEffect(() => {
    if (!address) return;
    
    const saved = localStorage.getItem(`agent_wallet_${address}`);
    if (saved) {
      const { privateKey } = JSON.parse(saved);
      const account = privateKeyToAccount(privateKey);
      setAgentWallet(account);
      setAgentExchangeClient(createExchangeClient(account));
      setIsApproved(true);
    }
  }, [address]);

  // Agent Wallet oluştur ve approve et
  const approveAgent = async () => {
    if (!exchangeClient || !address) return;

    setIsApproving(true);
    setError(null);
    try {
      // 1. Yeni private key oluştur
      const privateKey = generatePrivateKey();
      const agentAccount = privateKeyToAccount(privateKey);
      
      // 2. Agent'ı approve et
      const result = await exchangeClient.approveAgent({
        agentAddress: agentAccount.address,
      });

      if (result.status === 'ok') {
        // 3. LocalStorage'a kaydet
        localStorage.setItem(`agent_wallet_${address}`, JSON.stringify({
          privateKey,
          agentAddress: agentAccount.address,
        }));

        // 4. State'i güncelle
        setAgentWallet(agentAccount);
        setAgentExchangeClient(createExchangeClient(agentAccount));
        setIsApproved(true);
        setShowSuccess(true);
      }
    } catch (error: any) {
      console.error('Agent approval failed:', error);
      // Set user-friendly error message
      const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearSuccess = () => {
    setShowSuccess(false);
  };

  return {
    agentWallet,
    agentExchangeClient, // Bu client ile trading yap
    isApproved,
    isApproving,
    approveAgent,
    error,
    clearError,
    showSuccess,
    clearSuccess,
  };
}