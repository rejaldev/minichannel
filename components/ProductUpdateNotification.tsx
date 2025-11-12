'use client';

import { useEffect, useState } from 'react';
import { syncAPI } from '@/lib/desktop-api';
import { isElectron } from '@/lib/platform';

interface ProductUpdate {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  stock?: number;
  category?: string;
  updatedAt: string;
}

export default function ProductUpdateNotification() {
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [updates, setUpdates] = useState<ProductUpdate[]>([]);
  const [updateCount, setUpdateCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only run in Electron
    if (!isElectron()) return;

    // Listen to product sync updates
    syncAPI.onProductSyncUpdate((data: any) => {
      if (data.success && data.count > 0) {
        // Show notification banner
        setUpdateCount(data.count);
        setUpdates(data.updatedProducts || []);
        setShow(true);
      }
    });
  }, []);

  const handleViewUpdates = () => {
    setShowModal(true);
  };

  const handleDismiss = () => {
    setShow(false);
    setUpdates([]);
    setUpdateCount(0);
  };

  const handleApplyUpdates = async () => {
    setLoading(true);
    try {
      // Updates are already applied by sync service
      // This just acknowledges and closes the notification
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
      setShow(false);
      setShowModal(false);
      setUpdates([]);
      setUpdateCount(0);
    } catch (error) {
      console.error('Error applying updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!show) return null;

  return (
    <>
      {/* Notification Banner */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-2xl px-6 py-4 flex items-center gap-4 max-w-md">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1">
            <h4 className="font-bold text-lg">Produk Diupdate!</h4>
            <p className="text-sm text-blue-100">
              {updateCount} produk telah diperbarui dari server
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleViewUpdates}
              className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-sm"
            >
              Lihat Detail
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Tutup"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modal - Detail Updates */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Produk Diperbarui
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {updateCount} produk telah disinkronkan dengan server
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {updates.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {product.name}
                        </h3>
                        {product.category && (
                          <span className="inline-block text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full mt-1">
                            {product.category}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="space-y-1">
                          {/* Price Change */}
                          {product.oldPrice && product.oldPrice !== product.price ? (
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                                {formatPrice(product.oldPrice)}
                              </div>
                              <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                {formatPrice(product.price)}
                              </div>
                              <div className="text-xs text-green-600 dark:text-green-400">
                                {product.price > product.oldPrice ? '↑' : '↓'} {formatPrice(Math.abs(product.price - product.oldPrice))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {formatPrice(product.price)}
                            </div>
                          )}

                          {/* Stock Info */}
                          {product.stock !== undefined && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Stok: {product.stock}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Diperbarui: {formatDate(product.updatedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                ✓ Update otomatis diterapkan ke database lokal
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={handleApplyUpdates}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Menerapkan...
                    </>
                  ) : (
                    'Oke, Mengerti'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
