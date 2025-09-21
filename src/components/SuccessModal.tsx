'use client';

import { useEffect } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
};

export default function SuccessModal({ isOpen, onClose, title = "🏄‍♂️ Ready to Surf!", message = "You're all set to ride the waves of DeFi!" }: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Auto close after 3 seconds
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-green-500/30 shadow-2xl max-w-md w-full mx-4 overflow-hidden transform scale-100 animate-pulse">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 border-b border-green-500/30">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2">🏄‍♂️</div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <p className="text-green-300 text-sm mt-1">{message}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-2xl">🌊</span>
              <span className="text-green-300 font-semibold">Surfing Mode Activated!</span>
              <span className="text-2xl">🏄‍♀️</span>
            </div>
            <p className="text-green-200 text-sm">
              You can now swipe cards to trade and ride the waves of DeFi!
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-400 hover:to-emerald-500 transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            🌊 Start Surfing!
          </button>

          {/* Help Text */}
          <div className="mt-4 text-center">
            <p className="text-blue-300 text-xs">
              💡 Swipe right to go long, left to short, up to pass
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
