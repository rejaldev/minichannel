'use client';

import { useState, useEffect } from 'react';
import { backupAPI } from '@/lib/api';

export default function BackupDataPage() {
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [lastBackup, setLastBackup] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadBackupStatus();
    loadLastBackup();
  }, []);

  const loadBackupStatus = async () => {
    try {
      const response = await backupAPI.getAutoBackupStatus();
      setAutoBackupEnabled(response.data.enabled);
    } catch (error) {
      console.error('Error loading backup status:', error);
    }
  };

  const loadLastBackup = async () => {
    try {
      const response = await backupAPI.getLastBackup();
      setLastBackup(response.data.lastBackup);
    } catch (error) {
      console.error('Error loading last backup:', error);
    }
  };

  const handleManualBackup = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await backupAPI.createBackup();
      setMessage(`✅ Backup berhasil: ${response.data.filename}`);
      await loadLastBackup();
    } catch (error: any) {
      setMessage(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoBackup = async () => {
    try {
      const newValue = !autoBackupEnabled;
      await backupAPI.toggleAutoBackup(newValue);
      setAutoBackupEnabled(newValue);
      setMessage(`✅ Auto backup ${newValue ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleResetSettings = async () => {
    if (!confirm('⚠️ Yakin ingin reset semua settings ke default? Aksi ini tidak bisa dibatalkan!')) {
      return;
    }
    
    setLoading(true);
    try {
      await backupAPI.resetSettings();
      setMessage('✅ Settings berhasil direset ke default');
    } catch (error: any) {
      setMessage(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="px-4 md:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
        <a href="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition">
          Home
        </a>
        <span>›</span>
        <a href="/dashboard/settings" className="hover:text-gray-900 dark:hover:text-white transition">
          Settings
        </a>
        <span>›</span>
        <span className="font-semibold text-gray-900 dark:text-white">Backup Data</span>
      </nav>

      {/* Message Alert */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.startsWith('✅') ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
          {message}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 md:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Backup & Data</h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Kelola backup database dan export data sistem
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
          {/* Auto Backup */}
          <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">Auto Backup Database</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Backup otomatis database setiap hari pada pukul 00:00
                </p>
              </div>
              <button 
                onClick={handleToggleAutoBackup}
                className={`ml-4 relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  autoBackupEnabled ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                  autoBackupEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Manual Backup */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Manual Backup</span>
            </label>
            <div className="p-4 md:p-5 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
              <button 
                onClick={handleManualBackup}
                disabled={loading}
                className="w-full px-4 md:px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Membuat Backup...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Backup Database Sekarang</span>
                    </>
                  )}
                </span>
              </button>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-3 text-center">
                <span className="font-medium">Last backup:</span>{' '}
                {lastBackup ? (
                  <>
                    {formatDate(lastBackup.timestamp)} ({formatFileSize(lastBackup.size)})
                  </>
                ) : (
                  'Belum pernah backup'
                )}
              </p>
            </div>
          </div>

          {/* Export Data */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Data</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <button 
                onClick={() => backupAPI.exportTransactions()}
                className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Transaksi (CSV)</span>
              </button>
              <button 
                onClick={() => backupAPI.exportProducts()}
                className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-300"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Produk (CSV)</span>
              </button>
              <button 
                onClick={() => backupAPI.exportReport()}
                className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-300 sm:col-span-2 lg:col-span-1"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>Laporan (JSON)</span>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <label className="flex items-center space-x-2 text-sm font-semibold text-red-600 dark:text-red-400 mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Danger Zone</span>
            </label>
            <div className="p-4 md:p-5 bg-red-50 dark:bg-red-900/10 rounded-xl border-2 border-red-200 dark:border-red-800">
              <button 
                onClick={handleResetSettings}
                disabled={loading}
                className="w-full px-4 md:px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="hidden sm:inline">Reset All Settings to Default</span>
                  <span className="sm:hidden">Reset Settings</span>
                </span>
              </button>
              <p className="text-xs text-red-700 dark:text-red-400 mt-3 text-center">
                ⚠️ Akan menghapus semua pengaturan custom dan kembali ke default
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
