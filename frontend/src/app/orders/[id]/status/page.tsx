'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface OrderItem {
  id: string;
  itemId: string;
  itemName: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  storeId: string;
  totalAmount: number;
  status: 'PLACED' | 'PREPARING' | 'COMPLETED';
  createdAt: string;
  items: OrderItem[];
}

const statuses: Order['status'][] = ['PLACED', 'PREPARING', 'COMPLETED'];

const statusColors: Record<string, string> = {
  PLACED: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  PREPARING: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  COMPLETED: 'bg-green-500/20 text-green-300 border border-green-500/30',
};

export default function UpdateStatusPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = params.id as string;

  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | null>(
    null
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await api.get('/orders', { params: { limit: 100 } });
      const found = res.data.data.find((o: Order) => o.id === orderId);
      if (!found) throw new Error('Order not found');
      return found as Order;
    },
  });

  const mutation = useMutation({
    mutationFn: async (status: Order['status']) => {
      const res = await api.patch(`/orders/${orderId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },
  });

  function handleUpdate() {
    if (selectedStatus) {
      mutation.mutate(selectedStatus);
    }
  }

  if (isLoading)
    return (
      <main className="max-w-xl mx-auto px-8 py-12 text-orange-100/50">
        Loading order...
      </main>
    );
  if (isError || !data)
    return (
      <main className="max-w-xl mx-auto px-8 py-12">
        <p className="text-red-400">Order not found.</p>
      </main>
    );

  return (
    <main className="max-w-xl mx-auto px-8 py-12 animate-fade-in-up">
      <button
        onClick={() => router.push('/orders')}
        className="text-orange-400 hover:text-orange-300 text-sm mb-6"
      >
        ← Back to Orders
      </button>

      <p className="text-sm text-orange-400 font-semibold mb-1 tracking-widest uppercase">
        Order Details
      </p>
      <h1 className="text-3xl font-bold mb-2">
        Order #{data.id.slice(0, 8)}
      </h1>
      <p className="text-sm text-orange-100/40 mb-4">
        Store: {data.storeId.slice(0, 8)} •{' '}
        {new Date(data.createdAt).toLocaleString()}
      </p>

      <div className="mb-6">
        <span
          className={`text-xs px-3 py-1.5 rounded-full font-medium ${
            statusColors[data.status]
          }`}
        >
          Current: {data.status}
        </span>
      </div>

      <div className="bg-white/5 border border-orange-500/20 rounded-xl p-5 mb-8">
        <h2 className="font-medium mb-3 text-orange-100/70">Items</h2>
        {data.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-1.5">
            <span>
              {item.itemName} × {item.qty}
            </span>
            <span>₹{item.qty * item.price}</span>
          </div>
        ))}
        <div className="flex justify-between font-semibold mt-3 pt-3 border-t border-orange-500/20">
          <span>Total</span>
          <span>₹{data.totalAmount}</span>
        </div>
      </div>

      <label className="block text-sm font-medium mb-3 text-orange-100/70">
        Change status to:
      </label>
      <div className="flex gap-2 mb-6">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
              selectedStatus === status
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                : 'border border-orange-500/20 text-orange-100/60 hover:bg-orange-500/10'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <button
        onClick={handleUpdate}
        disabled={!selectedStatus || mutation.isPending}
        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-medium shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
      >
        {mutation.isPending ? 'Updating...' : 'Update Status'}
      </button>

      {mutation.isSuccess && (
        <p className="text-green-400 mt-4 animate-bounce-in">
          ✅ Status updated!
        </p>
      )}
      {mutation.isError && (
        <p className="text-red-400 mt-4">Couldn't update the status.</p>
      )}
    </main>
  );
}