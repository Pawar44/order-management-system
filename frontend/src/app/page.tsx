'use client';

import Link from 'next/link';

const features = [
  {
    icon: '🧾',
    title: 'Fast Order Entry',
    desc: 'Punch in items and quantities for any outlet in seconds.',
  },
  {
    icon: '📡',
    title: 'Live Kitchen Sync',
    desc: 'Every status change reaches every screen instantly, no refresh.',
  },
  {
    icon: '🔥',
    title: 'Sales Insights',
    desc: 'See what\'s selling, where, and how much you\'re earning.',
  },
];

const quickActions = [
  {
    href: '/orders/create',
    icon: '🧾',
    title: 'Punch In an Order',
    desc: 'Start a fresh order for any store',
  },
  {
    href: '/orders',
    icon: '🗂️',
    title: 'Browse Orders',
    desc: 'Track and filter every order live',
  },
  {
    href: '/analytics',
    icon: '🔥',
    title: 'Sales Dashboard',
    desc: 'Revenue and bestsellers at a glance',
  },
];

export default function Home() {
  return (
    <main className="relative max-w-5xl mx-auto px-8 py-16 overflow-hidden">
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-float pointer-events-none" />
      <div
        className="absolute top-40 -right-20 w-72 h-72 bg-red-500/15 rounded-full blur-3xl animate-float pointer-events-none"
        style={{ animationDelay: '2s' }}
      />

      <div className="relative text-center animate-fade-in-up">
        <p className="text-sm text-orange-400 font-semibold mb-3 tracking-widest uppercase">
          Built for busy kitchens
        </p>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
          <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-red-400 bg-clip-text text-transparent">
            Every Order,
          </span>
          <br />
          Every Store, Live.
        </h1>
        <p className="text-orange-100/60 max-w-xl mx-auto mb-8">
          One dashboard to punch in orders, track them kitchen-to-counter,
          and see exactly how each outlet is performing.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/orders/create"
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-7 py-3 rounded-full font-medium shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all"
          >
            Punch In an Order
          </Link>
          <Link
            href="/orders"
            className="border border-orange-500/40 text-orange-100 px-7 py-3 rounded-full hover:bg-orange-500/10 hover:scale-105 active:scale-95 transition-all"
          >
            Browse Orders
          </Link>
        </div>
      </div>

      <div className="relative grid md:grid-cols-3 gap-6 mt-24">
        {features.map((f, i) => (
          <div
            key={f.title}
            style={{ animationDelay: `${i * 120}ms` }}
            className="animate-bounce-in bg-white/5 border border-orange-500/20 rounded-2xl p-6 text-center hover:-translate-y-2 hover:border-orange-500/50 hover:bg-white/10 transition-all duration-300"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/30 flex items-center justify-center text-2xl">
              {f.icon}
            </div>
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-orange-100/50">{f.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="relative text-xl font-semibold mt-24 mb-6">
        Jump Right In
      </h2>
      <div className="relative grid md:grid-cols-3 gap-4">
        {quickActions.map((a, i) => (
          <Link
            key={a.href}
            href={a.href}
            style={{ animationDelay: `${(i + 3) * 120}ms` }}
            className="animate-bounce-in bg-white/5 border border-orange-500/20 rounded-xl p-5 flex items-start gap-3 hover:border-orange-500 hover:bg-orange-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            <span className="text-xl">{a.icon}</span>
            <div>
              <p className="font-medium text-sm">{a.title}</p>
              <p className="text-xs text-orange-100/50">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}