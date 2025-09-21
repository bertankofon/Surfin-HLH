'use client';

import HeaderBar from '@/components/HeaderBar';
import SwipeDeck from '@/components/SwipeDeck';
import BottomNav from '@/components/BottomNav';
import ErrorModal from '@/components/ErrorModal';
import SuccessModal from '@/components/SuccessModal';
import { HeaderProvider, useHeader } from '@/contexts/HeaderContext';
import { useAgentWallet } from '@/hooks/useAgentWallet';
import { useState } from 'react';

function HomeContent() {
  const [usd, setUsd] = useState(10);
  const [leverage, setLeverage] = useState(5);
  const [isCross, setIsCross] = useState(true);
  const { isExpanded } = useHeader();
  const { isApproved, isApproving, approveAgent, error, clearError, showSuccess, clearSuccess } = useAgentWallet();
  
  // Debug: Error state'ini kontrol et
  console.log('Error state:', error);
  console.log('Show success:', showSuccess);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 pb-16">
      <HeaderBar 
        usd={usd} 
        setUsd={setUsd} 
        leverage={leverage} 
        setLeverage={setLeverage} 
        isCross={isCross} 
        setIsCross={setIsCross}
        isApproved={isApproved}
        isApproving={isApproving}
        approveAgent={approveAgent}
        error={error}
        clearError={clearError}
        showSuccess={showSuccess}
        clearSuccess={clearSuccess}
      />
      <div className={`max-w-md mx-auto ${isExpanded ? 'pt-1' : 'pt-4'}`}>
        <SwipeDeck usd={usd} isCross={isCross} leverage={leverage} />
      </div>
      <BottomNav />
      
      {/* Error Modal */}
      <ErrorModal
        isOpen={!!error}
        onClose={clearError}
        error={error || ''}
        title="🌊 Surfing Error"
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={clearSuccess}
        title="🏄‍♂️ Ready to Surf!"
        message="Trading enabled! You can now ride the waves of DeFi!"
      />
    </main>
  );
}

export default function Home() {
  return (
    <HeaderProvider>
      <HomeContent />
    </HeaderProvider>
  );
}