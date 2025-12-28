'use client'

import { ArrowLeftRight, CheckCircle2 } from 'lucide-react'

export default function PendingTransfersPage() {
  return (
    <div className="px-4 md:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
        <a href="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition">Home</a>
        <span>›</span>
        <span className="text-gray-400">Approval</span>
        <span>›</span>
        <span className="font-semibold text-gray-900 dark:text-white">Pending Transfers</span>
      </nav>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-4 md:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <ArrowLeftRight className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Pending Transfers</h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Approval permintaan transfer stock antar cabang</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 md:p-6 lg:p-8">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <ArrowLeftRight className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Coming Soon</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">Fitur approval transfer stock sedang dalam pengembangan.</p>
            
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 text-left">Fitur yang akan datang:</h4>
                <div className="space-y-3 text-left">
                  {[
                    { title: 'Review Transfer Request', desc: 'Lihat detail permintaan transfer' },
                    { title: 'Approve / Reject', desc: 'Setujui atau tolak transfer dengan alasan' },
                    { title: 'Auto Stock Update', desc: 'Stok otomatis berpindah setelah approval' },
                    { title: 'Transfer History', desc: 'Riwayat transfer antar cabang' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
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
