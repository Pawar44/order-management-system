'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

interface OrderItemInput {
  itemId: string;
  itemName: string;
  qty: number;
  price: number;
}

export default function CreateOrderPage() {
  const [storeId, setStoreId] = useState('');
  const [items, setItems] = useState<OrderItemInput[]>([
    { itemId: '', itemName: '', qty: 1, price: 0 },
  ]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/orders', { storeId, items });
      return res.data;
    },
  });

  function updateItem(index: number, field: keyof OrderItemInput, value: string) {
    const updated = [...items];
    if (field === 'qty' || field === 'price') {
      updated[index][field] = Number(value);
    } else {
      updated[index][field] = value;
    }
    setItems(updated);
  }

  function addItemRow() {
    setItems([...items, { itemId: '', itemName: '', qty: 1, price: 0 }]);
  }

  function removeItemRow(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create Order</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Store ID</label>
          <input
            type="text"
            required
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            placeholder="Paste store UUID"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Items</label>
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                required
                placeholder="Item ID"
                value={item.itemId}
                onChange={(e) => updateItem(index, 'itemId', e.target.value)}
                className="border rounded px-2 py-1 w-1/5"
              />
              <input
                type="text"
                required
                placeholder="Item Name"
                value={item.itemName}
                onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                className="border rounded px-2 py-1 w-2/5"
              />
              <input
                type="number"
                required
                min={1}
                placeholder="Qty"
                value={item.qty}
                onChange={(e) => updateItem(index, 'qty', e.target.value)}
                className="border rounded px-2 py-1 w-1/5"
              />
              <input
                type="number"
                required
                min={0}
                step="0.01"
                placeholder="Price"
                value={item.price}
                onChange={(e) => updateItem(index, 'price', e.target.value)}
                className="border rounded px-2 py-1 w-1/5"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItemRow(index)}
                  className="text-red-600 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addItemRow}
            className="text-blue-600 text-sm"
          >
            + Add another item
          </button>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {mutation.isPending ? 'Placing order...' : 'Place Order'}
        </button>

        {mutation.isSuccess && (
          <p className="text-green-600">
            Order created! Total: ₹{mutation.data.totalAmount}
          </p>
        )}
        {mutation.isError && (
          <p className="text-red-600">
            Failed to create order. Check the Store ID and try again.
          </p>
        )}
      </form>
    </main>
  );
}