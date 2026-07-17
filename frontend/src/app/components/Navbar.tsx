'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/orders/create', label: 'Create Order' },
  { href: '/orders', label: 'Orders' },
  { href: '/analytics', label: 'Analytics' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-orange-900/30 px-8 py-4 flex items-center justify-between backdrop-blur sticky top-0 bg-[#0f0a08]/80 z-10">
      <Link
        href="/"
        className="font-bold text-lg flex items-center gap-2 hover:scale-105 transition-transform"
      >
        <span className="text-2xl">🍽️</span>
        <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
          OrderMS
        </span>
      </Link>
      <div className="flex gap-2">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm px-4 py-2 rounded-full transition-all ${
                active
                  ? 'bg-orange-500 text-white font-medium shadow-lg shadow-orange-500/30'
                  : 'text-orange-100/60 hover:bg-orange-500/10 hover:text-orange-200'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}