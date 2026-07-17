'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrders } from '@/lib/useOrders';

const statusColors: Record<string, string> = {
  PLACED: 'bg-yellow-100 text-yellow-800',
  PREPARING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

export default function OrdersListPage() {
  const [storeId, setStoreId] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, liveConnected } = useOrders(storeId, page);

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-4">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              liveConnected
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {liveConnected ? '● Live' : '○ Offline'}
          </span>
          <Link href="/orders/create" className="text-blue-600 text-sm">
            + New Order
          </Link>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by Store ID (leave blank for all)"
          value={storeId}
          onChange={(e) => {
            setStoreId(e.target.value);
            setPage(1);
          }}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {isLoading && <p>Loading orders...</p>}
      {isError && <p className="text-red-600">Failed to load orders.</p>}

      {data && (
        <>
          <div className="space-y-3">
            {data.data.length === 0 && (
              <p className="text-gray-500">No orders found.</p>
            )}
            {data.data.map((order) => (
              <div
                key={order.id}
                className="border rounded p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">
                    Store: {order.storeId.slice(0, 8)} •{' '}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.items.length} item(s) — ₹{order.totalAmount}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                  <Link
                    href={`/orders/${order.id}/status`}
                    className="text-blue-600 text-sm"
                  >
                    Update
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {data.pagination.page} of {data.pagination.totalPages || 1}
            </span>
            <button
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}