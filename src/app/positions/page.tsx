'use client';

import HeaderBar from '@/components/HeaderBar';
import PositionsList from '@/components/PositionsList';
import BottomNav from '@/components/BottomNav';
import { useState } from 'react';

export default function PositionsPage() {
  const [usd, setUsd] = useState(10);
  const [leverage, setLeverage] = useState(5);
  const [isCross, setIsCross] = useState(true);

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <HeaderBar usd={usd} setUsd={setUsd} leverage={leverage} setLeverage={setLeverage} isCross={isCross} setIsCross={setIsCross} />
      <div className="max-w-2xl mx-auto p-4">
        <PositionsList />
      </div>
      <BottomNav />
    </main>
  );
}
