'use client';

import { useEffect, useState } from 'react';
import { transactionsAPI, productsAPI } from '@/lib/api';
import { getAuth } from '@/lib/auth';

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      const { user: currentUser } = getAuth();
      
      try {
        // Only fetch summary for owner/manager (not kasir)
        if (currentUser && currentUser.role !== 'KASIR') {
          const summaryRes = await transactionsAPI.getSummary();
          setSummary(summaryRes.data);

          // Fetch low stock alerts
          const alertsRes = await productsAPI.getLowStockAlerts();
          setLowStockAlerts(alertsRes.data);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg p-4 md:p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl">
              <svg
                className="w-6 h-6 md:w-8 md:h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <div className="text-right">
              <p className="text-2xl md:text-4xl font-bold">
                {summary?.totalTransactions || 0}
              </p>
            </div>
          </div>
          <p className="text-slate-100 text-xs md:text-sm font-medium">Total Transaksi</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 md:p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl">
              <svg
                className="w-6 h-6 md:w-8 md:h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-right">
              <p className="text-lg md:text-2xl lg:text-3xl font-bold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(summary?.totalRevenue || 0)}
              </p>
            </div>
          </div>
          <p className="text-blue-100 text-xs md:text-sm font-medium">Total Pendapatan</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-4 md:p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl">
              <svg
                className="w-6 h-6 md:w-8 md:h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div className="text-right">
              <p className="text-2xl md:text-4xl font-bold">
                {lowStockAlerts.length}
              </p>
            </div>
          </div>
          <p className="text-amber-100 text-xs md:text-sm font-medium">Stok Menipis</p>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      {summary?.paymentMethodBreakdown && summary.paymentMethodBreakdown.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6 md:mb-8">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
            Metode Pembayaran
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {summary.paymentMethodBreakdown.map((method: any) => (
              <div
                key={method.paymentMethod}
                className="p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{method.paymentMethod}</p>
                <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  {method._count.id} transaksi
                </p>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  Rp {(method._sum.total || 0).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
            Peringatan Stok Menipis
          </h2>
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle px-4 md:px-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Variant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cabang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Min. Stok
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {lowStockAlerts.map((alert: any) => (
                  <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {alert.productVariant.product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {alert.productVariant.variantName}: {alert.productVariant.variantValue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {alert.productVariant.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {alert.cabang.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        {alert.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {alert.minStock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <a
          href="/dashboard/products"
          className="group block p-6 md:p-8 bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 rounded-xl shadow-lg transition transform hover:scale-105"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 md:p-4 bg-white bg-opacity-20 rounded-xl group-hover:bg-opacity-30 transition">
              <svg
                className="w-6 h-6 md:w-8 md:h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div className="ml-4 md:ml-6">
              <h3 className="text-lg md:text-xl font-bold text-white mb-1">Kelola Produk</h3>
              <p className="text-sm md:text-base text-slate-100">Tambah atau edit produk & stok</p>
            </div>
          </div>
        </a>

        <a
          href="/dashboard/transactions"
          className="group block p-6 md:p-8 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:border-slate-500 dark:hover:border-slate-400 transition transform hover:scale-105"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 md:p-4 bg-slate-100 dark:bg-slate-900 rounded-xl group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition">
              <svg
                className="w-6 h-6 md:w-8 md:h-8 text-slate-600 dark:text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <div className="ml-4 md:ml-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1">Riwayat Transaksi</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Lihat semua transaksi</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
