'use client'

import { Construction, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Feature {
  name: string
  description?: string
}

interface UnderConstructionProps {
  title?: string
  description?: string
  showBackButton?: boolean
  features?: Feature[]
  icon?: React.ReactNode
}

export default function UnderConstruction({ 
  title = "Halaman Dalam Pengembangan",
  description = "Fitur ini sedang dalam tahap pengembangan dan akan segera tersedia.",
  showBackButton = true,
  features = [],
  icon
}: UnderConstructionProps) {
  const router = useRouter()

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6">
          {icon || <Construction className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Coming Soon
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {description}
        </p>

        {features.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-left mt-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Fitur yang akan datang:
            </h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{feature.name}</p>
                    {feature.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{feature.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {showBackButton && (
          <button
            onClick={() => router.back()}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        )}
      </div>
    </div>
  )
}
