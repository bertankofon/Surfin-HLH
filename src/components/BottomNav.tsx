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
        className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs ${active ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}
        aria-label={label}
      >
        <Image
          src={iconSrc}
          alt={label}
          width={20}
          height={20}
          className={active ? 'opacity-100' : 'opacity-60'}
        />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-md mx-auto flex">
        {tab('/', 'Discover', '/globe.svg')}
        {tab('/positions', 'Positions', '/file.svg')}
        {tab('/bridge', 'Bridge', '/window.svg')}
      </div>
    </nav>
  );
}