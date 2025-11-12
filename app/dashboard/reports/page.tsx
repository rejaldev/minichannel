'use client';

import { useEffect, useState } from 'react';
import { transactionsAPI, productsAPI } from '@/lib/api';

export default function ReportsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      const [summaryRes, alertsRes] = await Promise.all([
        transactionsAPI.getSummary({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
        productsAPI.getLowStockAlerts(),
      ]);

      setSummary(summaryRes.data);
      setLowStockAlerts(alertsRes.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-0">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Laporan
        </h1>
      </div>

      {/* Date Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6 md:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-3 md:p-4 bg-white/30 rounded-xl backdrop-blur-sm">
              <svg
                className="w-8 h-8 md:w-10 md:h-10"
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
            <p className="text-2xl md:text-4xl font-bold">{summary?.totalTransactions || 0}</p>
          </div>
          <p className="text-slate-100 text-xs md:text-sm font-medium">Total Transaksi</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-3 md:p-4 bg-white/30 rounded-xl backdrop-blur-sm">
              <svg
                className="w-8 h-8 md:w-10 md:h-10"
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
              <p className="text-2xl md:text-3xl font-bold">
                Rp {((summary?.totalRevenue || 0) / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
          <p className="text-green-100 text-xs md:text-sm font-medium">Total Pendapatan</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-3 md:p-4 bg-white/30 rounded-xl backdrop-blur-sm">
              <svg
                className="w-8 h-8 md:w-10 md:h-10"
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
            <p className="text-2xl md:text-4xl font-bold">{lowStockAlerts.length}</p>
          </div>
          <p className="text-amber-100 text-xs md:text-sm font-medium">Stok Menipis</p>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      {summary?.paymentMethodBreakdown && summary.paymentMethodBreakdown.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">
            Breakdown Metode Pembayaran
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {summary.paymentMethodBreakdown.map((method: any) => (
              <div
                key={method.paymentMethod}
                className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6 hover:border-slate-500 dark:hover:border-slate-400 transition bg-white dark:bg-gray-800"
              >
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="p-2 md:p-3 bg-slate-100 dark:bg-slate-900 rounded-lg">
                    {method.paymentMethod === 'CASH' ? (
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    ) : method.paymentMethod === 'TRANSFER' ? (
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    )}
                  </div>
                </div>
                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {method.paymentMethod}
                </h3>
                <p className="text-2xl md:text-3xl font-bold text-slate-600 dark:text-slate-400 mb-1.5 md:mb-2">
                  {method._count.id}
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">
          Peringatan Stok Menipis
        </h2>
        {lowStockAlerts.length === 0 ? (
          <div className="text-center py-6 md:py-8">
            <svg
              className="mx-auto h-10 w-10 md:h-12 md:w-12 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-2 text-xs md:text-sm font-medium text-gray-900 dark:text-white">Semua stok aman!</p>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Tidak ada produk dengan stok menipis</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Produk
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Variant
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    SKU
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Cabang
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Stok Saat Ini
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Min. Stok
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {lowStockAlerts.map((alert: any) => {
                  const percentage = (alert.quantity / alert.minStock) * 100;
                  const isDanger = percentage < 50;

                  return (
                    <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                        {alert.productVariant.product.name}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        {alert.productVariant.variantName}: {alert.productVariant.variantValue}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {alert.productVariant.sku}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        {alert.cabang.name}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <span
                          className={`px-2 md:px-3 py-0.5 md:py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isDanger
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {alert.quantity}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        {alert.minStock}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${
                                isDanger ? 'bg-red-600' : 'bg-yellow-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">{percentage.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
