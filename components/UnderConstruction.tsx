'use client'

import { Construction, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UnderConstructionProps {
  title?: string
  description?: string
  showBackButton?: boolean
}

export default function UnderConstruction({ 
  title = "Halaman Dalam Pengembangan",
  description = "Fitur ini sedang dalam tahap pengembangan dan akan segera tersedia.",
  showBackButton = true
}: UnderConstructionProps) {
  const router = useRouter()

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-6">
          <Construction className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {description}
        </p>
      </div>
    </div>
  )
}
