'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrders } from '@/lib/useOrders';

const statusColors: Record<string, string> = {
  PLACED: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  PREPARING: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  COMPLETED: 'bg-green-500/20 text-green-300 border border-green-500/30',
};

export default function OrdersListPage() {
  const [storeId, setStoreId] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, liveConnected } = useOrders(storeId, page);

  return (
    <main className="max-w-4xl mx-auto px-8 py-12 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-orange-400 font-semibold mb-1 tracking-widest uppercase">
            Live Board
          </p>
          <h1 className="text-3xl font-bold">Orders</h1>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              liveConnected
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'bg-white/5 text-orange-100/40 border border-orange-500/10'
            }`}
          >
            {liveConnected ? '🟢 Live' : '⚪ Offline'}
          </span>
          <Link
            href="/orders/create"
            className="text-orange-400 hover:text-orange-300 text-sm font-medium"
          >
            + New Order
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Filter by Store ID (leave blank for all)"
          value={storeId}
          onChange={(e) => {
            setStoreId(e.target.value);
            setPage(1);
          }}
          className="w-full bg-white/5 border border-orange-500/20 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors placeholder:text-orange-100/30"
        />
      </div>

      {isLoading && <p className="text-orange-100/50">Loading orders...</p>}
      {isError && <p className="text-red-400">Couldn't load orders.</p>}

      {data && (
        <>
          <div className="space-y-3">
            {data.data.length === 0 && (
              <p className="text-orange-100/40">No orders yet — go punch one in!</p>
            )}
            {data.data.map((order) => (
              <div
                key={order.id}
                className="bg-white/5 border border-orange-500/20 rounded-xl p-4 flex items-center justify-between hover:border-orange-500/40 transition-colors"
              >
                <div>
                  <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-orange-100/40">
                    Store: {order.storeId.slice(0, 8)} •{' '}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-orange-100/40">
                    {order.items.length} item(s) — ₹{order.totalAmount}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                  <Link
                    href={`/orders/${order.id}/status`}
                    className="text-orange-400 hover:text-orange-300 text-sm font-medium"
                  >
                    Update
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border border-orange-500/20 rounded-full text-sm hover:bg-orange-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-orange-100/40">
              Page {data.pagination.page} of {data.pagination.totalPages || 1}
            </span>
            <button
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border border-orange-500/20 rounded-full text-sm hover:bg-orange-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}