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
    <main className="max-w-2xl mx-auto px-8 py-12 animate-fade-in-up">
      <p className="text-sm text-orange-400 font-semibold mb-2 tracking-widest uppercase">
        New Order
      </p>
      <h1 className="text-3xl font-bold mb-8">Punch In an Order</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-orange-100/70">
            Store ID
          </label>
          <input
            type="text"
            required
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            placeholder="Paste store UUID"
            className="w-full bg-white/5 border border-orange-500/20 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors placeholder:text-orange-100/30"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-orange-100/70">
            Items
          </label>
          {items.map((item, index) => (
            <div
              key={index}
              className="flex gap-2 items-center bg-white/5 border border-orange-500/20 rounded-lg p-3"
            >
              <input
                type="text"
                required
                placeholder="Item ID"
                value={item.itemId}
                onChange={(e) => updateItem(index, 'itemId', e.target.value)}
                className="bg-transparent border border-orange-500/20 rounded px-2 py-1.5 w-1/5 focus:border-orange-500 focus:outline-none text-sm"
              />
              <input
                type="text"
                required
                placeholder="Item Name"
                value={item.itemName}
                onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                className="bg-transparent border border-orange-500/20 rounded px-2 py-1.5 w-2/5 focus:border-orange-500 focus:outline-none text-sm"
              />
              <input
                type="number"
                required
                min={1}
                placeholder="Qty"
                value={item.qty}
                onChange={(e) => updateItem(index, 'qty', e.target.value)}
                className="bg-transparent border border-orange-500/20 rounded px-2 py-1.5 w-1/5 focus:border-orange-500 focus:outline-none text-sm"
              />
              <input
                type="number"
                required
                min={0}
                step="0.01"
                placeholder="Price"
                value={item.price}
                onChange={(e) => updateItem(index, 'price', e.target.value)}
                className="bg-transparent border border-orange-500/20 rounded px-2 py-1.5 w-1/5 focus:border-orange-500 focus:outline-none text-sm"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItemRow(index)}
                  className="text-red-400 hover:text-red-300 text-sm px-1"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addItemRow}
            className="text-orange-400 hover:text-orange-300 text-sm font-medium"
          >
            + Add another item
          </button>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-medium shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          {mutation.isPending ? 'Sending to kitchen...' : 'Place Order'}
        </button>

        {mutation.isSuccess && (
          <p className="text-green-400 animate-bounce-in">
            🎉 Order's in! Total: ₹{mutation.data.totalAmount}
          </p>
        )}
        {mutation.isError && (
          <p className="text-red-400">
            Couldn't place that order — double check the Store ID.
          </p>
        )}
      </form>
    </main>
  );
}