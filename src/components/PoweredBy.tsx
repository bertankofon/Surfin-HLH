'use client';

import Image from 'next/image';

export default function PoweredBy() {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-0">
      <div className="max-w-md mx-auto px-4 pb-4">
        <div className="text-center">
          <p className="text-sm text-slate-400 mb-3 font-medium">Powered by</p>
          <div className="flex items-center justify-center gap-8">
            <Image
              src="/hl-bg.png"
              alt="Hyperliquid"
              width={100}
              height={30}
              className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity"
            />
            <Image
              src="/debridge.bg.png"
              alt="deBridge"
              width={100}
              height={30}
              className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
