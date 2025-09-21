// src/components/DeBridgeWidget.tsx
'use client';

import { useCallback, useEffect, useRef } from 'react';
import Script from 'next/script';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import settings from '../../widget-settings.json';

export default function DeBridgeWidget() {
  const widgetRef = useRef<any>(null);
  const elId = (settings as any)?.element || 'debridgeWidget';
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const setExternalWallet = (w: any) => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    w.setExternalEVMWallet?.({
      provider: eth,
      name: 'Browser Wallet',
      imageSrc: 'https://app.debridge.finance/assets/images/wallet/metamask.svg',
    });
  };

  const init = useCallback(async () => {
    const w = (window as any);
    if (!w.deBridge || widgetRef.current) return;

    const params = {
      ...settings,
      element: elId,
      width: '100%',
      mode: (settings as any)?.mode?.toString().toLowerCase() || 'deswap',
      v: (settings as any)?.v ?? '1',
    };

    try {
      const widget = await w.deBridge.widget(params);
      widget.on?.('needConnect', () => {
        if (isConnected) setExternalWallet(widget);
        else openConnectModal?.();
      });
      widgetRef.current = widget;

      if (isConnected) setExternalWallet(widget);
    } catch (e) {
      console.error('[deBridge] init error', e);
    }
  }, [elId, isConnected, openConnectModal]);

  useEffect(() => {
    if ((window as any).deBridge && !widgetRef.current) init();
    return () => {
      try {
        const el = document.getElementById(elId);
        if (el) el.innerHTML = '';
        widgetRef.current = null;
      } catch {}
    };
  }, [init, elId]);

  useEffect(() => {
    if (widgetRef.current && isConnected) setExternalWallet(widgetRef.current);
  }, [isConnected]);

  return (
    <div className="w-full">
      <Script src="https://app.debridge.finance/assets/scripts/widget.js" strategy="afterInteractive" onLoad={init} />
      <div id={elId} />
    </div>
  );
}