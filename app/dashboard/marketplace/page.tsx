'use client'

import { Store, CheckCircle2 } from 'lucide-react'

export default function MarketplacePage() {
  return (
    <div className="px-4 md:px-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <a href="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition">Dashboard</a>
        <span>›</span>
        <span className="text-gray-900 dark:text-white font-medium">Marketplace</span>
      </nav>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Content */}
        <div className="p-4 md:p-6 lg:p-8">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
              <Store className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Coming Soon</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">Fitur integrasi marketplace sedang dalam pengembangan.</p>
            
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 text-left">Fitur yang akan datang:</h4>
                <div className="space-y-3 text-left">
                  {[
                    { title: 'Multi-Platform Sync', desc: 'Sinkronisasi produk ke berbagai marketplace' },
                    { title: 'Order Management', desc: 'Kelola pesanan dari semua marketplace dalam satu dashboard' },
                    { title: 'Auto Stock Sync', desc: 'Sinkronisasi stok otomatis setelah penjualan' },
                    { title: 'Price Management', desc: 'Atur harga berbeda per marketplace' },
                    { title: 'Shipping Integration', desc: 'Integrasi dengan kurir JNE, J&T, SiCepat, dll' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
