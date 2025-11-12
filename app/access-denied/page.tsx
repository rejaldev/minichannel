'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuth } from '@/lib/auth';

export default function AccessDenied() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg 
                className="w-12 h-12 text-red-600 dark:text-red-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Akses Ditolak
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Dashboard web hanya untuk OWNER dan MANAGER
            </p>
          </div>

          {/* Message */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <svg 
                className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                  clipRule="evenodd" 
                />
              </svg>
              <div className="text-left">
                <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                  Role KASIR tidak diizinkan mengakses web dashboard
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  Silakan gunakan aplikasi desktop untuk akses sistem kasir
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-left">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Cara Akses Desktop App:
            </h3>
            <ol className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
              <li>Download aplikasi desktop AnekaBuana Store</li>
              <li>Install dan jalankan aplikasi di komputer kasir</li>
              <li>Login dengan akun KASIR Anda</li>
              <li>Gunakan fitur POS untuk transaksi penjualan</li>
            </ol>
          </div>

          {/* Countdown */}
          <div className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Anda akan logout otomatis dalam{' '}
              <span className="font-bold text-red-600 dark:text-red-400 text-lg">
                {countdown}
              </span>{' '}
              detik
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-200 dark:shadow-red-900/30"
              >
                Logout Sekarang
              </button>
            </div>
          </div>

          {/* Support */}
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Butuh bantuan? Hubungi admin atau manager Anda
          </p>
        </div>
      </div>
    </div>
  );
}
