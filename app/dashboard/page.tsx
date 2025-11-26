'use client';

import { useEffect, useState } from 'react';
import { transactionsAPI, productsAPI } from '@/lib/api';
import { getAuth } from '@/lib/auth';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, AlertTriangle, Clock, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [branchPerformance, setBranchPerformance] = useState<any[]>([]);
  const [timeStats, setTimeStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      const { user: currentUser } = getAuth();
      
      try {
        // Only fetch summary for owner/manager (not kasir)
        if (currentUser && currentUser.role !== 'KASIR') {
          const [summaryRes, alertsRes, trendRes, topProductsRes, branchRes, timeStatsRes] = await Promise.all([
            transactionsAPI.getSummary(),
            productsAPI.getLowStockAlerts(),
            transactionsAPI.getSalesTrend({ days: 7 }),
            transactionsAPI.getTopProducts({ limit: 5 }),
            transactionsAPI.getBranchPerformance(),
            transactionsAPI.getTimeStats()
          ]);

          setSummary(summaryRes.data);
          setLowStockAlerts(alertsRes.data);
          setSalesTrend(trendRes.data.trend);
          setTopProducts(topProductsRes.data.topProducts);
          setBranchPerformance(branchRes.data.branchPerformance);
          setTimeStats(timeStatsRes.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Selamat Datang, {user?.name || 'User'}!</h1>
        <p className="text-purple-100">Berikut ringkasan bisnis Anda hari ini</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Transaksi */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Transaksi</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {summary?.totalTransactions || 0}
              </p>
              <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Hari ini</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ShoppingBag className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Total Pendapatan */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Pendapatan</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(summary?.totalRevenue || 0)}
              </p>
              <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+12% dari kemarin</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Stok Menipis */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Stok Menipis</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {lowStockAlerts.length}
              </p>
              <div className="flex items-center mt-2 text-sm text-orange-600 dark:text-orange-400">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span>Perlu perhatian</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Package className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      {salesTrend.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tren Penjualan (7 Hari Terakhir)
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="date" 
                className="text-xs text-gray-600 dark:text-gray-400"
                tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
              />
              <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
                labelFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { weekday: 'long', month: 'long', day: 'numeric' })}
                formatter={(value: any) => ['Rp ' + value.toLocaleString('id-ID'), 'Total Penjualan']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                name="Total Penjualan"
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Products & Branch Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        {topProducts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <Package className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Produk Terlaris
              </h2>
            </div>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.productVariantId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{product.productName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{product.totalQuantity} unit</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Rp {product.totalRevenue.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Branch Performance */}
        {branchPerformance.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Performa Cabang
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={branchPerformance}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="cabangName" 
                  className="text-xs text-gray-600 dark:text-gray-400"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
                  formatter={(value: any) => 'Rp ' + value.toLocaleString('id-ID')}
                />
                <Bar dataKey="totalRevenue" fill="#8b5cf6" name="Total Pendapatan" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Time Statistics */}
      {timeStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Busiest Hour & Day */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Waktu Tersibuk
              </h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Jam Tersibuk</span>
                  <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {timeStats.busiestHour.hour}:00
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {timeStats.busiestHour.count} transaksi · Rp {timeStats.busiestHour.total.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hari Tersibuk</span>
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {timeStats.busiestDay.day}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {timeStats.busiestDay.count} transaksi · Rp {timeStats.busiestDay.total.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          {/* Daily Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Distribusi Transaksi per Hari
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeStats.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="day" 
                  className="text-xs text-gray-600 dark:text-gray-400"
                />
                <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb' }}
                  formatter={(value: any) => [value + ' transaksi', 'Total']}
                />
                <Bar dataKey="count" fill="#3b82f6" name="Jumlah Transaksi" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Payment Method Breakdown */}
      {summary?.paymentMethodBreakdown && summary.paymentMethodBreakdown.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Metode Pembayaran
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {summary.paymentMethodBreakdown.map((method: any) => (
              <div
                key={method.paymentMethod}
                className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{method.paymentMethod}</span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded">
                    {method._count.id}x
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Rp {(method._sum.total || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total transaksi {method.paymentMethod.toLowerCase()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Peringatan Stok Menipis
              </h2>
            </div>
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-semibold rounded-full">
              {lowStockAlerts.length} item
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-750">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Variant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cabang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stok
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {lowStockAlerts.map((alert: any) => (
                  <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {alert.productVariant.product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {alert.productVariant.variantName}: {alert.productVariant.variantValue}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {alert.productVariant.sku}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {alert.cabang.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {alert.quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/dashboard/products"
          className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 transition-all"
        >
          <div className="flex items-center mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">Kelola Produk</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tambah dan edit produk & stok</p>
        </a>

        <a
          href="/dashboard/transactions"
          className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all"
        >
          <div className="flex items-center mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">Riwayat Transaksi</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Lihat semua transaksi penjualan</p>
        </a>

        <a
          href="/dashboard/categories"
          className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all"
        >
          <div className="flex items-center mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">Kategori</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Kelola kategori produk</p>
        </a>
      </div>
    </div>
  );
}
