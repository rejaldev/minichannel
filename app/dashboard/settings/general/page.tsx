'use client';

import { useState, useEffect } from 'react';

export default function GeneralSettingsPage() {
  return (
    <div className="px-4 md:px-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <a href="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition">Dashboard</a>
        <span>›</span>
        <a href="/dashboard/settings" className="hover:text-gray-900 dark:hover:text-white transition">Settings</a>
        <span>›</span>
        <span className="text-gray-900 dark:text-white font-medium">General</span>
      </nav>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
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
    </div>
  );
}
