'use client';

import { useEffect, useState } from 'react';
import { transactionsAPI } from '@/lib/api';
import { getAuth } from '@/lib/auth';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const { user } = getAuth();

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate, paymentMethod]);

  const fetchTransactions = async () => {
    try {
      const res = await transactionsAPI.getTransactions({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        paymentMethod: paymentMethod || undefined,
      });
      setTransactions(res.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = async (id: string) => {
    try {
      const res = await transactionsAPI.getTransaction(id);
      setSelectedTransaction(res.data);
    } catch (error) {
      console.error('Error fetching transaction detail:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Transaksi
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-slate-900/20 rounded-2xl shadow-lg border border-blue-100 dark:border-slate-800 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Metode Pembayaran
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Semua</option>
              <option value="CASH">CASH</option>
              <option value="TRANSFER">TRANSFER</option>
              <option value="QRIS">QRIS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada transaksi</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelanggan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pembayaran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-medium text-gray-900">
                        {transaction.transactionNo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.customerName || '-'}
                      </div>
                      {transaction.customerPhone && (
                        <div className="text-xs text-gray-500">
                          {transaction.customerPhone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        Rp {transaction.total.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
                        {transaction.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          transaction.paymentStatus
                        )}`}
                      >
                        {transaction.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => viewDetail(transaction.id)}
                        className="text-slate-600 hover:text-slate-900 font-medium"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detail Transaksi
                </h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">No. Invoice</p>
                  <p className="font-mono font-semibold text-gray-900">
                    {selectedTransaction.transactionNo}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedTransaction.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pelanggan</p>
                  <p className="font-semibold text-gray-900">
                    {selectedTransaction.customerName || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kasir</p>
                  <p className="font-semibold text-gray-900">
                    {selectedTransaction.kasir?.name}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Item Produk</h3>
                <div className="space-y-2">
                  {selectedTransaction.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">{item.variantInfo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                        </p>
                        <p className="font-semibold text-gray-900">
                          Rp {item.subtotal.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      Rp {selectedTransaction.subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  {selectedTransaction.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Diskon:</span>
                      <span className="text-red-600 font-medium">
                        -Rp {selectedTransaction.discount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-slate-600">
                      Rp {selectedTransaction.total.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Metode Pembayaran:</span>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-slate-100 text-slate-800">
                    {selectedTransaction.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
