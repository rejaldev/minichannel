'use client';

import { useState, useEffect } from 'react';
import { transactionsAPI, returnsAPI } from '@/lib/api';

interface Transaction {
  id: string;
  transactionNo: string;
  customerName?: string;
  customerPhone?: string;
  total: number;
  totalAmount?: number; // Backend uses totalAmount
  paymentMethod: string;
  isSplitPayment: boolean;
  paymentAmount1?: number;
  paymentMethod2?: string;
  paymentAmount2?: number;
  createdAt: string;
  hasReturnRequest?: boolean;
  returnStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  items: Array<{
    id: string;
    productName?: string;
    variantInfo?: string;
    quantity: number;
    price: number;
    subtotal?: number;
    productVariantId: string;
    productVariant?: {
      id: string;
      variantName: string;
      variantValue: string;
      product: {
        id: string;
        name: string;
      };
    };
  }>;
}

interface Props {
  user: any;
  onClose: () => void;
  cabangId?: string | null;
}

export default function TransactionHistory({ user, onClose, cabangId }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestItems, setRequestItems] = useState<{ [key: string]: number }>({});
  const [requestReason, setRequestReason] = useState('DAMAGED');
  const [requestNotes, setRequestNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get effective cabang ID (use prop if provided, otherwise user's cabang)
  const effectiveCabangId = cabangId || user?.cabangId;

  useEffect(() => {
    fetchTransactions();
  }, [effectiveCabangId]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionsAPI.getTransactions({
        cabangId: effectiveCabangId || undefined,
      });
      
      // Backend returns array directly, not { transactions: [...] }
      const txList = Array.isArray(res.data) ? res.data : (res.data?.transactions || []);
      
      // Check return status for each transaction
      try {
        const returnsRes = await returnsAPI.getReturns({
          cabangId: effectiveCabangId,
        });
        const returns = Array.isArray(returnsRes.data) ? returnsRes.data : (returnsRes.data?.returns || []);
        
        const txWithReturnStatus = txList.map((tx: Transaction) => {
          const returnRequest = returns.find((ret: any) => ret.transactionId === tx.id);
          return {
            ...tx,
            hasReturnRequest: !!returnRequest,
            returnStatus: returnRequest?.status
          };
        });
        
        setTransactions(txWithReturnStatus);
      } catch {
        setTransactions(txList);
      }
    } catch (error) {
      console.error('[History] Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to get item display info
  const getProductName = (item: Transaction['items'][0]) => {
    return item.productName || item.productVariant?.product?.name || 'Unknown Product';
  };

  const getVariantInfo = (item: Transaction['items'][0]) => {
    if (item.variantInfo) return item.variantInfo;
    if (item.productVariant) {
      return item.productVariant.variantValue;
    }
    return '';
  };

  const getSubtotal = (item: Transaction['items'][0]) => {
    return item.subtotal || (item.price * item.quantity);
  };

  const getTotal = (transaction: Transaction) => {
    return transaction.total || transaction.totalAmount || 0;
  };

  const filteredTransactions = transactions.filter((t) =>
    t.transactionNo.toLowerCase().includes(search.toLowerCase()) ||
    t.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    t.customerPhone?.includes(search)
  );

  const handleRequestClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowRequestModal(true);
    const items: { [key: string]: number } = {};
    transaction.items.forEach((item) => {
      items[item.productVariantId] = 0;
    });
    setRequestItems(items);
  };

  const handleRequestSubmit = async () => {
    if (!selectedTransaction) return;

    const itemsToReturn = Object.entries(requestItems)
      .filter(([_, qty]) => (qty as number) > 0)
      .map(([variantId, qty]) => {
        const item = selectedTransaction.items.find((i) => i.productVariantId === variantId);
        return {
          productVariantId: variantId,
          quantity: qty as number,
          price: item!.price,
        };
      });

    if (itemsToReturn.length === 0) {
      alert('Pilih minimal 1 item untuk diretur');
      return;
    }

    try {
      setSubmitting(true);
      
      await returnsAPI.createReturn({
        transactionId: selectedTransaction.id,
        cabangId: effectiveCabangId,
        reason: requestReason,
        notes: requestNotes || undefined,
        items: itemsToReturn,
        refundMethod: selectedTransaction.paymentMethod,
      });
      
      alert('Return request berhasil dikirim!\n\nRequest Anda akan diproses oleh Manager/Owner.');
      
      setShowRequestModal(false);
      setSelectedTransaction(null);
      setRequestItems({});
      setRequestReason('DAMAGED');
      setRequestNotes('');
      
      await fetchTransactions();
    } catch (error: any) {
      console.error('[History] Error creating return request:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Gagal mengirim request';
      alert('Gagal mengirim request return:\n\n' + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getTotalReturn = () => {
    if (!selectedTransaction) return 0;
    return Object.entries(requestItems).reduce((sum, [variantId, qty]) => {
      const item = selectedTransaction.items.find((i) => i.productVariantId === variantId);
      return sum + (item ? item.price * (qty as number) : 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* History Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Riwayat Transaksi</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari invoice number, nama customer, atau nomor HP..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {search ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{transaction.transactionNo}</p>
                          {transaction.returnStatus === 'APPROVED' && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-semibold rounded-full">
                              Approved
                            </span>
                          )}
                          {transaction.returnStatus === 'REJECTED' && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs font-semibold rounded-full">
                              Rejected
                            </span>
                          )}
                          {transaction.returnStatus === 'PENDING' && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs font-semibold rounded-full">
                              ⏳ Pending
                            </span>
                          )}
                          {transaction.returnStatus === 'COMPLETED' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.createdAt).toLocaleString('id-ID')}
                        </p>
                        {transaction.customerName && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {transaction.customerName}
                            {transaction.customerPhone && ` - ${transaction.customerPhone}`}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          Rp {getTotal(transaction).toLocaleString('id-ID')}
                        </p>
                        {transaction.isSplitPayment ? (
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            <p>{transaction.paymentMethod}: Rp {transaction.paymentAmount1?.toLocaleString('id-ID')}</p>
                            <p>{transaction.paymentMethod2}: Rp {transaction.paymentAmount2?.toLocaleString('id-ID')}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.paymentMethod}</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items:</p>
                      <div className="space-y-1">
                        {transaction.items.map((item) => {
                          const productName = getProductName(item);
                          const variantInfo = getVariantInfo(item);
                          const subtotal = getSubtotal(item);
                          const showVariant = variantInfo && !['Default', 'Standar', 'Standard', 'default', 'standar', 'standard', 'Default: Default', 'Default: Standard', 'Default: Standar', '-', ''].includes(variantInfo);
                          return (
                            <div key={item.id} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                              <span>
                                {item.quantity}x {productName}
                                {showVariant && ` (${variantInfo})`}
                              </span>
                              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-4">
                      {transaction.hasReturnRequest ? (
                        <div className="w-full py-2 rounded-lg font-medium bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 cursor-not-allowed">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Return Sudah Diajukan
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRequestClick(transaction)}
                          className="w-full py-2 rounded-lg font-medium transition-colors bg-orange-600 text-white hover:bg-orange-700 flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          Request Return
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Return Modal */}
      {showRequestModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Request Return Barang</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedTransaction.transactionNo}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Request akan dikirim ke Manager/Owner untuk diproses</p>
              </div>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedTransaction(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pilih Item & Jumlah Return
                </label>
                <div className="space-y-2">
                  {selectedTransaction.items.map((item) => {
                    const productName = getProductName(item);
                    const variantInfo = getVariantInfo(item);
                    const showVariant = variantInfo && !['Default', 'Standar', 'Standard', 'default', 'standar', 'standard', 'Default: Default', 'Default: Standard', 'Default: Standar'].includes(variantInfo);
                    return (
                      <div key={item.productVariantId} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{productName}</p>
                          {showVariant && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{variantInfo}</p>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-400">Rp {item.price.toLocaleString('id-ID')} x {item.quantity}</p>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={requestItems[item.productVariantId] || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setRequestItems({
                              ...requestItems,
                              [item.productVariantId]: Math.min(Math.max(0, val), item.quantity),
                            });
                          }}
                          className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alasan Return *
                </label>
                <select
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="DAMAGED">Barang Rusak</option>
                  <option value="WRONG_ITEM">Salah Barang</option>
                  <option value="EXPIRED">Kadaluarsa</option>
                  <option value="CUSTOMER_REQUEST">Permintaan Customer</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catatan (opsional)
                </label>
                <textarea
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={3}
                  placeholder="Keterangan tambahan..."
                />
              </div>

              {/* Total */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Return:</span>
                  <span className="text-xl font-bold text-red-600 dark:text-red-400">
                    Rp {getTotalReturn().toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedTransaction(null);
                  }}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleRequestSubmit}
                  disabled={getTotalReturn() === 0 || submitting}
                  className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Kirim Return Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
