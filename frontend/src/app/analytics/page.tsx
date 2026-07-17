'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

interface OrdersPerDay {
  day: string;
  orderCount: number;
}

interface RevenuePerStore {
  storeId: string;
  storeName: string;
  totalRevenue: number;
}

interface TopItem {
  itemId: string;
  itemName: string;
  totalQtySold: number;
}

const PIE_COLORS = ['#fc8019', '#ff4d4d', '#f59e0b', '#ec4899', '#a855f7'];

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/40 transition-colors">
      <h2 className="font-semibold text-orange-100/90">{title}</h2>
      <p className="text-xs text-orange-100/40 mb-4">{subtitle}</p>
      {children}
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: '#1a120b',
  border: '1px solid rgba(252,128,25,0.3)',
  borderRadius: '8px',
  color: '#fff3ec',
  fontSize: '13px',
};

export default function AnalyticsPage() {
  const ordersPerDay = useQuery<OrdersPerDay[]>({
    queryKey: ['analytics', 'orders-per-day'],
    queryFn: async () => (await api.get('/analytics/orders-per-day')).data,
  });

  const revenuePerStore = useQuery<RevenuePerStore[]>({
    queryKey: ['analytics', 'revenue-per-store'],
    queryFn: async () => (await api.get('/analytics/revenue-per-store')).data,
  });

  const topItems = useQuery<TopItem[]>({
    queryKey: ['analytics', 'top-items'],
    queryFn: async () => (await api.get('/analytics/top-items')).data,
  });

  const ordersChartData = (ordersPerDay.data ?? [])
    .slice()
    .reverse()
    .map((row) => ({
      day: new Date(row.day).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      }),
      orders: row.orderCount,
    }));

  const revenueChartData = (revenuePerStore.data ?? []).map((row) => ({
    name: row.storeName,
    revenue: row.totalRevenue,
  }));

  const topItemsChartData = (topItems.data ?? []).map((row) => ({
    name: row.itemName,
    value: row.totalQtySold,
  }));

  const totalRevenue = (revenuePerStore.data ?? []).reduce(
    (sum, r) => sum + r.totalRevenue,
    0
  );
  const totalOrders = (ordersPerDay.data ?? []).reduce(
    (sum, r) => sum + r.orderCount,
    0
  );
  const totalItemsSold = (topItems.data ?? []).reduce(
    (sum, r) => sum + r.totalQtySold,
    0
  );

  return (
    <main className="max-w-5xl mx-auto px-8 py-12 animate-fade-in-up">
      <p className="text-sm text-orange-400 font-semibold mb-1 tracking-widest uppercase">
        Sales Dashboard
      </p>
      <h1 className="text-3xl font-bold mb-10">How You're Doing</h1>

      {/* Summary stat cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/30 rounded-2xl p-5">
          <p className="text-xs text-orange-200/60 uppercase tracking-wide mb-1">
            Total Revenue
          </p>
          <p className="text-2xl font-bold">₹{totalRevenue}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 rounded-2xl p-5">
          <p className="text-xs text-purple-200/60 uppercase tracking-wide mb-1">
            Total Orders
          </p>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-2xl p-5">
          <p className="text-xs text-green-200/60 uppercase tracking-wide mb-1">
            Items Sold
          </p>
          <p className="text-2xl font-bold">{totalItemsSold}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Orders per day - bar chart */}
        <ChartCard title="Orders Per Day" subtitle="Order volume over time">
          {ordersPerDay.isLoading ? (
            <p className="text-sm text-orange-100/40">Loading...</p>
          ) : ordersChartData.length === 0 ? (
            <p className="text-sm text-orange-100/30">Nothing here yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ordersChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(252,128,25,0.1)" />
                <XAxis dataKey="day" stroke="#fff3ec80" fontSize={12} />
                <YAxis stroke="#fff3ec80" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(252,128,25,0.08)' }} />
                <Bar dataKey="orders" fill="#fc8019" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Revenue per store - bar chart */}
        <ChartCard title="Revenue Per Store" subtitle="Earnings by outlet">
          {revenuePerStore.isLoading ? (
            <p className="text-sm text-orange-100/40">Loading...</p>
          ) : revenueChartData.length === 0 ? (
            <p className="text-sm text-orange-100/30">Nothing here yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(252,128,25,0.1)" />
                <XAxis dataKey="name" stroke="#fff3ec80" fontSize={12} />
                <YAxis stroke="#fff3ec80" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(34,197,94,0.08)' }} />
                <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Top items - pie chart */}
      <ChartCard title="Top 5 Bestsellers" subtitle="What's flying off the shelf">
        {topItems.isLoading ? (
          <p className="text-sm text-orange-100/40">Loading...</p>
        ) : topItemsChartData.length === 0 ? (
          <p className="text-sm text-orange-100/30">Nothing here yet.</p>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-4">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={topItemsChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {topItemsChartData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 min-w-[160px]">
              {topItemsChartData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="truncate">{item.name}</span>
                  <span className="ml-auto text-orange-100/50">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </ChartCard>
    </main>
  );
}