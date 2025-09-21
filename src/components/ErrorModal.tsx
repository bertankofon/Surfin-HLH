'use client';

import { useEffect } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  error: string;
  title?: string;
};

export default function ErrorModal({ isOpen, onClose, error, title = "🌊 Wave Error" }: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-red-500/30 shadow-2xl max-w-md w-full mx-4 overflow-hidden transform scale-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 p-6 border-b border-red-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌊</span>
              <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="text-red-300 text-sm">Something went wrong with the wave</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="text-red-300 font-semibold mb-2">Error Details:</h3>
                <p className="text-red-200 text-sm leading-relaxed break-words">
                  {error}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl font-semibold hover:from-slate-500 hover:to-slate-600 transition-all duration-300 shadow-lg"
            >
              🏄‍♀️ Try Again
            </button>
            <button
              onClick={() => {
                // Copy error to clipboard
                navigator.clipboard.writeText(error);
                // You could add a toast notification here
              }}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-400 hover:to-cyan-500 transition-all duration-300 shadow-lg"
            >
              📋 Copy
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-4 text-center">
            <p className="text-blue-300 text-xs">
              💡 Make sure you have deposited funds before trading
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
