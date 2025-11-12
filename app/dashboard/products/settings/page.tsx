'use client';

import { useEffect, useState } from 'react';
import { settingsAPI } from '@/lib/api';

export default function ProductSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    lowStockThreshold: '10',
    criticalStockThreshold: '5',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsAPI.getSettings();
      setSettings({
        lowStockThreshold: res.data.lowStockThreshold || '10',
        criticalStockThreshold: res.data.criticalStockThreshold || '5',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use default values if settings not found
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await settingsAPI.updateSettings(settings);
      alert('Settings berhasil disimpan!');
    } catch (error: any) {
      console.error('Save settings error:', error);
      alert(error.response?.data?.error || 'Gagal menyimpan settings');
    } finally {
      setSaving(false);
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Pengaturan Produk
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Konfigurasi global untuk manajemen stok dan produk
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Stock Warning Settings */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Peringatan Stok
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Atur threshold untuk warning stok rendah. Ini akan mempengaruhi tampilan di POS dan laporan stok.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Low Stock Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={settings.lowStockThreshold}
                  onChange={(e) => setSettings({ ...settings, lowStockThreshold: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="10"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Stok di bawah nilai ini akan ditandai <span className="text-yellow-600 font-semibold">KUNING</span> (warning)
                </p>
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Contoh: Stok = 8, Threshold = 10 → <span className="font-semibold">⚠️ Low Stock</span>
                  </p>
                </div>
              </div>

              {/* Critical Stock Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Critical Stock Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={settings.criticalStockThreshold}
                  onChange={(e) => setSettings({ ...settings, criticalStockThreshold: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="5"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Stok di bawah nilai ini akan ditandai <span className="text-red-600 font-semibold">MERAH</span> (critical)
                </p>
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Contoh: Stok = 3, Threshold = 5 → <span className="font-semibold">🚨 Critical!</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Preview Warna Stok:</h3>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Stok &gt; {settings.lowStockThreshold}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Stok {settings.criticalStockThreshold} - {settings.lowStockThreshold}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Stok &lt; {settings.criticalStockThreshold}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Stok = 0
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={saving}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
