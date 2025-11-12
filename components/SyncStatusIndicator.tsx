'use client';

import { useEffect, useState } from 'react';
import { syncAPI } from '@/lib/desktop-api';

interface NetworkStatus {
  status: 'online' | 'unstable' | 'offline' | 'unknown';
  isOnline: boolean;
  isOffline: boolean;
}

interface QueueStats {
  total: number;
  pending: number;
  failed: number;
  warningLevel: 'none' | 'warning' | 'critical';
}

export default function SyncStatusIndicator() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    status: 'unknown',
    isOnline: false,
    isOffline: false
  });
  const [queueStats, setQueueStats] = useState<QueueStats>({
    total: 0,
    pending: 0,
    failed: 0,
    warningLevel: 'none'
  });
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);

  useEffect(() => {
    // Initial fetch
    fetchNetworkStatus();
    fetchQueueStats();

    // Listen to real-time updates
    syncAPI.onNetworkStatusChange((data: any) => {
      setNetworkStatus({
        status: data.status as 'online' | 'unstable' | 'offline' | 'unknown',
        isOnline: data.status === 'online',
        isOffline: data.status === 'offline'
      });
    });

    syncAPI.onQueueUpdate((data: any) => {
      setQueueStats({
        total: data.total,
        pending: data.pending,
        failed: data.failed,
        warningLevel: data.warningLevel as 'none' | 'warning' | 'critical'
      });
    });

    syncAPI.onProductSyncUpdate((data: any) => {
      if (data.success) {
        setLastSyncTime(new Date());
      }
    });

    syncAPI.onTransactionSyncUpdate((data: any) => {
      if (data.success) {
        setLastSyncTime(new Date());
      }
    });

    // Poll queue stats every 10 seconds
    const interval = setInterval(fetchQueueStats, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchNetworkStatus = async () => {
    try {
      const status = await syncAPI.getNetworkStatus();
      setNetworkStatus({
        status: status.status as 'online' | 'unstable' | 'offline' | 'unknown',
        isOnline: status.isOnline,
        isOffline: status.isOffline
      });
    } catch (error) {
      console.error('Failed to fetch network status:', error);
    }
  };

  const fetchQueueStats = async () => {
    try {
      const stats = await syncAPI.getQueueStats();
      setQueueStats({
        total: stats.total,
        pending: stats.pending,
        failed: stats.failed,
        warningLevel: stats.warningLevel as 'none' | 'warning' | 'critical'
      });
    } catch (error) {
      console.error('Failed to fetch queue stats:', error);
    }
  };

  const handleSyncNow = async () => {
    if (syncing) return;
    
    setSyncing(true);
    try {
      // Sync products and transactions
      await Promise.all([
        syncAPI.syncProductsNow(),
        syncAPI.syncTransactionsNow()
      ]);
      
      setLastSyncTime(new Date());
      await fetchQueueStats();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleRetryFailed = async () => {
    if (syncing) return;
    
    setSyncing(true);
    try {
      await syncAPI.retryFailedNow();
      await fetchQueueStats();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = () => {
    switch (networkStatus.status) {
      case 'online': return 'bg-green-500';
      case 'unstable': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (networkStatus.status) {
      case 'online': return 'Online';
      case 'unstable': return 'Unstable';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = () => {
    switch (networkStatus.status) {
      case 'online': return '🟢';
      case 'unstable': return '🟡';
      case 'offline': return '🔴';
      default: return '⚪';
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Belum sync';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSyncTime.getTime()) / 1000);
    
    if (diff < 60) return `${diff}d yang lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m yang lalu`;
    return lastSyncTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Compact Status Badge */}
      <div className="flex items-center gap-3">
        {/* Network Status */}
        <button
          onClick={() => setShowSyncModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-all"
        >
          <span className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`}></span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getStatusText()}
          </span>
        </button>

        {/* Queue Warning Badge */}
        {queueStats.total > 0 && (
          <button
            onClick={() => setShowSyncModal(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all ${
              queueStats.warningLevel === 'critical'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-2 border-red-300 dark:border-red-700 animate-pulse'
                : queueStats.warningLevel === 'warning'
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{queueStats.total} pending</span>
          </button>
        )}

        {/* Sync Button */}
        <button
          onClick={handleSyncNow}
          disabled={syncing || networkStatus.isOffline}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
          title="Sync Now"
        >
          <svg className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Status Sinkronisasi
              </h3>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Network Status */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status Jaringan</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getStatusIcon()}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{getStatusText()}</span>
                  </div>
                </div>
              </div>

              {/* Last Sync */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Terakhir Sync</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatLastSync()}</span>
                </div>
              </div>

              {/* Queue Stats */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Antrian Transaksi</div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{queueStats.total}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{queueStats.pending}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{queueStats.failed}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Gagal</div>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              {queueStats.warningLevel !== 'none' && (
                <div className={`rounded-lg p-3 ${
                  queueStats.warningLevel === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300'
                }`}>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-sm">
                      {queueStats.warningLevel === 'critical'
                        ? '⚠️ Antrian sangat panjang! Segera sync saat online.'
                        : '⚡ Antrian mulai banyak. Pastikan koneksi stabil.'}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSyncNow}
                  disabled={syncing || networkStatus.isOffline}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <svg className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {syncing ? 'Syncing...' : 'Sync Sekarang'}
                </button>

                {queueStats.failed > 0 && (
                  <button
                    onClick={handleRetryFailed}
                    disabled={syncing || networkStatus.isOffline}
                    className="px-4 py-2.5 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Retry Gagal
                  </button>
                )}
              </div>

              {networkStatus.isOffline && (
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Sync otomatis akan berjalan saat koneksi kembali
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
