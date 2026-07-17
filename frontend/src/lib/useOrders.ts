'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';

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

interface OrdersResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useOrders(storeId: string, page: number) {
  const queryClient = useQueryClient();
  const [liveConnected, setLiveConnected] = useState(false);

  const query = useQuery<OrdersResponse>({
    queryKey: ['orders', storeId, page],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (storeId) params.store_id = storeId;
      const res = await api.get('/orders', { params });
      return res.data;
    },
    enabled: true,
  });

  useEffect(() => {
    const socket = getSocket();

    function handleConnect() {
      setLiveConnected(true);
      if (storeId) {
        socket.emit('join_store', storeId);
      }
    }

    function handleDisconnect() {
      setLiveConnected(false);
    }

    function handleOrderCreated() {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }

    function handleOrderStatusUpdated() {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('order:created', handleOrderCreated);
    socket.on('order:status_updated', handleOrderStatusUpdated);

    if (socket.connected && storeId) {
      socket.emit('join_store', storeId);
      setLiveConnected(true);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('order:created', handleOrderCreated);
      socket.off('order:status_updated', handleOrderStatusUpdated);
    };
  }, [storeId, queryClient]);

  return { ...query, liveConnected };
}

export type { Order, OrderItem };