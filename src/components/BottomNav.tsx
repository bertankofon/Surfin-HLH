'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const tab = (href: string, label: string, iconSrc: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs transition-colors ${active ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-blue-300'}`}
        aria-label={label}
      >
        <Image
          src={iconSrc}
          alt={label}
          width={20}
          height={20}
          className={`transition-opacity ${active ? 'opacity-100' : 'opacity-60'}`}
        />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-blue-800/30">
      <div className="max-w-md mx-auto flex">
        {tab('/', 'Discover', '/globe.svg')}
        {tab('/positions', 'Positions', '/file.svg')}
        {tab('/bridge', 'Bridge', '/window.svg')}
      </div>
    </nav>
  );
}