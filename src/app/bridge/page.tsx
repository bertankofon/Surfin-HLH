'use client';

import HeaderBar from '@/components/HeaderBar';
import BottomNav from '@/components/BottomNav';
import { useState } from 'react';

export default function BridgePage() {
  const [usd, setUsd] = useState(10);
  const [leverage, setLeverage] = useState(5);
  const [isCross, setIsCross] = useState(true);

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <HeaderBar usd={usd} setUsd={setUsd} leverage={leverage} setLeverage={setLeverage} isCross={isCross} setIsCross={setIsCross} />
      <div className="max-w-md mx-auto p-4 text-gray-600">Bridge coming soon.</div>
      <BottomNav />
    </main>
  );
}
