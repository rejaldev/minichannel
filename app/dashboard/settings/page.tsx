'use client';

import { useState, useEffect } from 'react';
import { cabangAPI } from '@/lib/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'stock' | 'cabang' | 'printer' | 'backup'>('general');

  return (
    <div className="px-4 md:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
        <a href="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition">
          Home
        </a>
        <span>›</span>
        <span className="font-semibold text-gray-900 dark:text-white">Pengaturan</span>
      </nav>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4 md:mb-6 overflow-x-auto">
        <nav className="flex space-x-4 md:space-x-8 min-w-max md:min-w-0">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 md:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`py-3 md:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'stock'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Stok
          </button>
          <button
            onClick={() => setActiveTab('cabang')}
            className={`py-3 md:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'cabang'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Cabang
          </button>
          <button
            onClick={() => setActiveTab('printer')}
            className={`py-3 md:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'printer'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Printer
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 md:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'backup'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Backup & Data
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'general' && <GeneralSettings />}
        {activeTab === 'stock' && <StockSettings />}
        {activeTab === 'cabang' && <CabangSettings />}
        {activeTab === 'printer' && <PrinterSettings />}
        {activeTab === 'backup' && <BackupSettings />}
      </div>
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 md:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">General Settings</h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Pengaturan umum aplikasi dan preferensi sistem
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Theme Settings */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span>Theme Mode</span>
          </label>
          <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow">
            <option>Light</option>
            <option>Dark</option>
            <option>Auto (System)</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span>Language</span>
          </label>
          <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow">
            <option>Bahasa Indonesia</option>
            <option>English</option>
          </select>
        </div>

        {/* Currency Format */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Currency Format</span>
          </label>
          <input
            type="text"
            value="IDR"
            disabled
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Format mata uang saat ini: Indonesian Rupiah (IDR)
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-1">
                Pengaturan Global Aplikasi
              </h3>
              <p className="text-sm text-slate-800 dark:text-slate-400 leading-relaxed">
                Perubahan pada pengaturan general akan mempengaruhi tampilan dan perilaku seluruh aplikasi, 
                termasuk web dashboard dan desktop POS.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
          <button className="w-full md:w-auto px-6 md:px-8 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Simpan Perubahan</span>
            </span>
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center md:text-right">
            Refresh halaman untuk melihat perubahan
          </p>
        </div>
      </div>
    </div>
  );
}

function StockSettings() {
  const [minStock, setMinStock] = useState('5');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState('');

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/settings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMinStock(data.minStock || '5');
        }
      } catch (error) {
        console.error('Failed to load stock settings:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          minStock: minStock
        }),
      });

      if (response.ok) {
        setMessage('✓ Pengaturan stok berhasil disimpan');
      } else {
        const error = await response.json();
        setMessage(`✗ ${error.error || 'Gagal menyimpan pengaturan'}`);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setMessage('✗ Gagal menyimpan pengaturan');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 md:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Pengaturan Stok</h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Konfigurasi alert dan manajemen stok produk
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Minimum Stock Setting */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Minimum Stok (Global)</span>
          </label>
          <div className="p-5 bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl font-bold focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-shadow"
                  placeholder="5"
                />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Berlaku untuk <strong>semua produk</strong>
                  </p>
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Alert jika stok ≤ {minStock || 0} unit
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Cara Kerja:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Sistem akan menampilkan alert jika stok produk mencapai atau di bawah nilai ini</li>
                    <li>Pengaturan ini berlaku global untuk semua produk dan cabang</li>
                    <li>Rekomendasi: set 5-10 untuk stok minimum yang aman</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Example Alert Preview */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Preview Alert Stok Rendah</span>
          </label>
          <div className="space-y-3">
            {/* Example Alert 1 - Critical */}
            <div className="p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">Stok Kritis!</p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                    <strong>Seragam SD Size 10</strong> di <strong>Cabang Pusat</strong> - Stok tersisa: <strong>2 unit</strong> (Min: {minStock || 5})
                  </p>
                </div>
              </div>
            </div>

            {/* Example Alert 2 - Warning */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Stok Rendah</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    <strong>Celana Olahraga L</strong> di <strong>Cabang Timur</strong> - Stok tersisa: <strong>{minStock || 5} unit</strong> (Min: {minStock || 5})
                  </p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 flex items-center">
            <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Alert akan muncul di dashboard dan halaman stok saat ada produk di bawah minimum
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-1">
                💡 Tips Manajemen Stok
              </h3>
              <ul className="text-sm text-slate-800 dark:text-slate-400 space-y-1 mt-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Set minimum stok berdasarkan rata-rata penjualan mingguan</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Monitor dashboard secara rutin untuk cek alert stok rendah</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Lakukan restock sebelum stok mencapai nilai minimum</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 ${
            message.includes('✓') 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              {message.includes('✓') ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              )}
            </svg>
            <span className="font-medium">{message}</span>
          </div>
        )}

        {/* Save Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full md:w-auto px-6 md:px-8 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Menyimpan...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Simpan Perubahan</span>
              </span>
            )}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center md:text-right">
            Perubahan akan berlaku segera untuk semua produk
          </p>
        </div>
      </div>
    </div>
  );
}

function CabangSettings() {
  const [cabangs, setCabangs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCabang, setEditingCabang] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    fetchCabangs();
  }, []);

  const fetchCabangs = async () => {
    try {
      setLoading(true);
      const response = await cabangAPI.getCabangs();
      setCabangs(response.data);
    } catch (error) {
      console.error('Error fetching cabangs:', error);
      alert('Gagal memuat data cabang');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cabang?: any) => {
    if (cabang) {
      setEditingCabang(cabang);
      setFormData({
        name: cabang.name,
        address: cabang.address || '',
        phone: cabang.phone || ''
      });
    } else {
      setEditingCabang(null);
      setFormData({ name: '', address: '', phone: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCabang(null);
    setFormData({ name: '', address: '', phone: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address) {
      alert('Nama dan alamat wajib diisi!');
      return;
    }

    try {
      if (editingCabang) {
        await cabangAPI.updateCabang(editingCabang.id, formData);
        alert('Cabang berhasil diupdate!');
      } else {
        await cabangAPI.createCabang(formData);
        alert('Cabang berhasil ditambahkan!');
      }
      handleCloseModal();
      fetchCabangs();
    } catch (error: any) {
      console.error('Error saving cabang:', error);
      alert(error.response?.data?.error || 'Gagal menyimpan cabang');
    }
  };

  const handleToggleActive = async (cabang: any) => {
    if (!confirm(`${cabang.isActive ? 'Nonaktifkan' : 'Aktifkan'} cabang ${cabang.name}?`)) {
      return;
    }

    try {
      await cabangAPI.updateCabang(cabang.id, { isActive: !cabang.isActive });
      alert('Status cabang berhasil diubah!');
      fetchCabangs();
    } catch (error) {
      console.error('Error toggling cabang status:', error);
      alert('Gagal mengubah status cabang');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat data cabang...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 md:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-slate-100 dark:bg-slate-900 rounded-xl">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Manajemen Cabang</h2>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Kelola cabang toko dan lokasi bisnis
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm font-medium"
            >
              + Tambah Cabang
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          {cabangs.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Belum ada cabang terdaftar</p>
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm font-medium"
              >
                Tambah Cabang Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cabangs.map((cabang) => (
                <div
                  key={cabang.id}
                  className={`p-5 rounded-lg border-2 transition-all ${
                    cabang.isActive
                      ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-gray-800'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {cabang.name}
                        </h3>
                        {cabang.isActive ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {cabang.address}
                      </p>
                      {cabang.phone && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          📞 {cabang.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center mb-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Users</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {cabang._count?.users || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Stocks</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {cabang._count?.stocks || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Transaksi</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {cabang._count?.transactions || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(cabang)}
                      className="flex-1 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(cabang)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                        cabang.isActive
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {cabang.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Add/Edit Cabang */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingCabang ? 'Edit Cabang' : 'Tambah Cabang Baru'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Cabang *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Contoh: Cabang Pusat, Cabang Timur"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alamat *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Jl. Contoh No. 123"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="08123456789"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium"
                >
                  {editingCabang ? 'Update' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function PrinterSettings() {
  const [settings, setSettings] = useState({
    autoPrintEnabled: true,
    printerName: '',
    paperWidth: 80,
    showPreview: false,
    printCopies: 1,
    // Receipt Header Customization
    storeName: 'ANEKABUANA STORE',
    branchName: 'Cabang Pusat',
    address: 'Jl. Contoh No. 123',
    phone: '021-12345678',
    footerText1: 'Terima kasih atas kunjungan Anda',
    footerText2: 'Barang yang sudah dibeli tidak dapat dikembalikan',
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState('');

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // TODO: Get cabangId from auth/user context
        const cabangId = 'default'; // Temporary hardcoded
        
        const response = await fetch(`http://localhost:5000/api/settings/printer?cabangId=${cabangId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSettings({
            autoPrintEnabled: data.autoPrintEnabled ?? true,
            printerName: data.printerName || '',
            paperWidth: data.paperWidth || 80,
            showPreview: data.showPreview ?? false,
            printCopies: data.printCopies || 1,
            storeName: data.storeName || 'ANEKABUANA STORE',
            branchName: data.branchName || 'Cabang Pusat',
            address: data.address || 'Jl. Contoh No. 123',
            phone: data.phone || '021-12345678',
            footerText1: data.footerText1 || 'Terima kasih atas kunjungan Anda',
            footerText2: data.footerText2 || 'Barang yang sudah dibeli tidak dapat dikembalikan',
          });
        }
      } catch (error) {
        console.error('Failed to load printer settings:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // TODO: Get cabangId from auth/user context
      const cabangId = 'default'; // Temporary hardcoded
      
      const response = await fetch('http://localhost:5000/api/settings/printer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          cabangId,
          ...settings,
        }),
      });

      if (response.ok) {
        setMessage('✓ Pengaturan printer berhasil disimpan');
      } else {
        const error = await response.json();
        setMessage(`✗ ${error.error || 'Gagal menyimpan pengaturan'}`);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setMessage('✗ Gagal menyimpan pengaturan');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 md:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Printer Settings</h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Konfigurasi printer thermal untuk Desktop POS
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Auto Print Toggle */}
        <div className="flex items-start justify-between p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-base font-semibold text-gray-900 dark:text-white">Auto Print Receipt</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cetak struk secara otomatis setelah transaksi selesai tanpa konfirmasi
            </p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, autoPrintEnabled: !settings.autoPrintEnabled })}
            className={`ml-4 relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              settings.autoPrintEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                settings.autoPrintEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Printer Name */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Nama Printer</span>
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(Opsional)</span>
          </label>
          <input
            type="text"
            value={settings.printerName}
            onChange={(e) => setSettings({ ...settings, printerName: e.target.value })}
            placeholder="Contoh: POS-58, Thermal Printer (kosongkan untuk default)"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
        </div>

        {/* Paper Width */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span>Ukuran Kertas Thermal</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSettings({ ...settings, paperWidth: 58 })}
              className={`relative px-6 py-4 border-2 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.paperWidth === 58
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30'
              }`}
            >
              {settings.paperWidth === 58 && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="text-2xl mb-1">58mm</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Standard</div>
            </button>
            <button
              onClick={() => setSettings({ ...settings, paperWidth: 80 })}
              className={`relative px-6 py-4 border-2 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.paperWidth === 80
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30'
              }`}
            >
              {settings.paperWidth === 80 && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="text-2xl mb-1">80mm</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Wide</div>
            </button>
          </div>
        </div>

        {/* Additional Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Show Preview */}
          <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Print Preview</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Tampilkan preview sebelum print
                </p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, showPreview: !settings.showPreview })}
                className={`ml-3 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showPreview ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showPreview ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Print Copies */}
          <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Jumlah Copy</span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="1"
                max="3"
                value={settings.printCopies}
                onChange={(e) => setSettings({ ...settings, printCopies: Math.max(1, Math.min(3, parseInt(e.target.value) || 1)) })}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Maks. 3</span>
            </div>
          </div>
        </div>

        {/* Receipt Header Customization */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Kustomisasi Header Struk</span>
          </label>
          <div className="space-y-4 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Nama Toko
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  placeholder="ANEKABUANA STORE"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Nama Cabang
                </label>
                <input
                  type="text"
                  value={settings.branchName}
                  onChange={(e) => setSettings({ ...settings, branchName: e.target.value })}
                  placeholder="Cabang Pusat"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Alamat Toko
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="Jl. Contoh No. 123"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nomor Telepon
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="021-12345678"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Receipt Footer Customization */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span>Kustomisasi Footer Struk</span>
          </label>
          <div className="space-y-4 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Teks Footer 1
              </label>
              <input
                type="text"
                value={settings.footerText1}
                onChange={(e) => setSettings({ ...settings, footerText1: e.target.value })}
                placeholder="Terima kasih atas kunjungan Anda"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Teks Footer 2
              </label>
              <input
                type="text"
                value={settings.footerText2}
                onChange={(e) => setSettings({ ...settings, footerText2: e.target.value })}
                placeholder="Barang yang sudah dibeli tidak dapat dikembalikan"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-5">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                Pengaturan untuk Desktop App (Electron)
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed">
                Konfigurasi ini akan diterapkan pada aplikasi Desktop POS saat melakukan transaksi. 
                Pastikan thermal printer sudah terinstall dan terkonfigurasi dengan benar di sistem operasi.
              </p>
              <div className="mt-3 flex items-center space-x-2 text-xs text-blue-700 dark:text-blue-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Support thermal printer 58mm & 80mm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Preview */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Preview Struk</span>
          </label>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 p-4 md:p-6">
            <div className={`mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden ${
              settings.paperWidth === 58 ? 'max-w-[232px]' : 'max-w-[320px]'
            }`}>
              {/* Receipt Content */}
              <div className="p-4 font-mono text-xs space-y-2">
                <div className="text-center border-b border-gray-300 dark:border-gray-600 pb-2">
                  <div className="font-bold text-sm mb-1">{settings.storeName || 'ANEKABUANA STORE'}</div>
                  <div className="text-[10px] text-gray-600 dark:text-gray-400">{settings.branchName || 'Cabang Pusat'}</div>
                  <div className="text-[10px] text-gray-600 dark:text-gray-400">{settings.address || 'Jl. Contoh No. 123'}</div>
                  <div className="text-[10px] text-gray-600 dark:text-gray-400">Telp: {settings.phone || '021-12345678'}</div>
                </div>
                
                <div className="text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span>Owner Toko</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>{new Date().toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>No. Trans:</span>
                    <span>TRX-20231113-001</span>
                  </div>
                </div>

                <div className="border-t border-b border-gray-300 dark:border-gray-600 py-2 space-y-1">
                  <div>
                    <div className="flex justify-between font-semibold">
                      <span>Produk Sample A</span>
                      <span>Rp 50.000</span>
                    </div>
                    <div className="text-[10px] text-gray-600 dark:text-gray-400 pl-2">
                      2x @ Rp 25.000
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-semibold">
                      <span>Produk Sample B</span>
                      <span>Rp 35.000</span>
                    </div>
                    <div className="text-[10px] text-gray-600 dark:text-gray-400 pl-2">
                      1x @ Rp 35.000
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span>Subtotal:</span>
                    <span>Rp 85.000</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>Diskon:</span>
                    <span>Rp 5.000</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-gray-300 dark:border-gray-600 pt-1">
                    <span>TOTAL:</span>
                    <span>Rp 80.000</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>Bayar (CASH):</span>
                    <span>Rp 100.000</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>Kembalian:</span>
                    <span>Rp 20.000</span>
                  </div>
                </div>

                <div className="text-center text-[10px] text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-300 dark:border-gray-600">
                  <div>{settings.footerText1 || 'Terima kasih atas kunjungan Anda'}</div>
                  <div>{settings.footerText2 || 'Barang yang sudah dibeli tidak dapat dikembalikan'}</div>
                </div>
              </div>
            </div>
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Preview ukuran kertas: <span className="font-semibold">{settings.paperWidth}mm</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Preview ini hanya tampilan. Test print akan menggunakan printer sesungguhnya di Desktop App.
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 ${
            message.includes('✓') 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              {message.includes('✓') ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              )}
            </svg>
            <span className="font-medium">{message}</span>
          </div>
        )}

        {/* Save Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full md:w-auto px-6 md:px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Menyimpan...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Simpan Pengaturan</span>
              </span>
            )}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center md:text-right">
            Perubahan akan berlaku saat transaksi berikutnya
          </p>
        </div>
      </div>
    </div>
  );
}

function BackupSettings() {
  return (
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
            <button className="ml-4 relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 bg-gray-300 dark:bg-gray-600">
              <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform translate-x-1" />
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
            <button className="w-full px-4 md:px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Backup Database Sekarang</span>
              </span>
            </button>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-3 text-center">
              <span className="font-medium">Last backup:</span> Belum pernah backup
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
            <button className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Transaksi (CSV)</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-300">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Produk (CSV)</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-300 sm:col-span-2 lg:col-span-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Laporan (PDF)</span>
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
            <button className="w-full px-4 md:px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
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
  );
}
