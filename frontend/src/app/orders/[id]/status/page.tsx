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
  PLACED: 'bg-yellow-100 text-yellow-800',
  PREPARING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

export default function UpdateStatusPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = params.id as string;

  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | null>(
    null
  );

  // We don't have a GET /orders/:id endpoint, so we fetch the list
  // and find this one order — simplest option given the existing API.
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

  if (isLoading) return <main className="max-w-xl mx-auto p-8">Loading order...</main>;
  if (isError || !data)
    return (
      <main className="max-w-xl mx-auto p-8">
        <p className="text-red-600">Order not found.</p>
      </main>
    );

  return (
    <main className="max-w-xl mx-auto p-8">
      <button
        onClick={() => router.push('/orders')}
        className="text-blue-600 text-sm mb-4"
      >
        ← Back to Orders
      </button>

      <h1 className="text-2xl font-bold mb-2">
        Order #{data.id.slice(0, 8)}
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        Store: {data.storeId.slice(0, 8)} •{' '}
        {new Date(data.createdAt).toLocaleString()}
      </p>

      <div className="mb-4">
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            statusColors[data.status]
          }`}
        >
          Current: {data.status}
        </span>
      </div>

      <div className="border rounded p-4 mb-6">
        <h2 className="font-medium mb-2">Items</h2>
        {data.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-1">
            <span>
              {item.itemName} × {item.qty}
            </span>
            <span>₹{item.qty * item.price}</span>
          </div>
        ))}
        <div className="flex justify-between font-medium mt-2 pt-2 border-t">
          <span>Total</span>
          <span>₹{data.totalAmount}</span>
        </div>
      </div>

      <label className="block text-sm font-medium mb-2">
        Change status to:
      </label>
      <div className="flex gap-2 mb-4">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-3 py-2 rounded border text-sm ${
              selectedStatus === status
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <button
        onClick={handleUpdate}
        disabled={!selectedStatus || mutation.isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {mutation.isPending ? 'Updating...' : 'Update Status'}
      </button>

      {mutation.isSuccess && (
        <p className="text-green-600 mt-3">Status updated successfully!</p>
      )}
      {mutation.isError && (
        <p className="text-red-600 mt-3">Failed to update status.</p>
      )}
    </main>
  );
}   