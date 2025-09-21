'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const tab = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`flex-1 text-center py-2 text-sm ${active ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-md mx-auto flex">{tab('/', 'Discover')}{tab('/positions', 'Positions')}{tab('/bridge', 'Bridge')}</div>
    </nav>
  );
}