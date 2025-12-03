'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import UnderConstruction from '@/components/UnderConstruction'

export default function TransfersPage() {
  return (
    <ProtectedRoute>
      <UnderConstruction 
        title="Transfer Stock"
        description="Fitur transfer stok antar cabang sedang dalam pengembangan. Anda akan dapat mentransfer produk antar lokasi dengan mudah."
      />
    </ProtectedRoute>
  )
}
