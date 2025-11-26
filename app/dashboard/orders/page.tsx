'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import UnderConstruction from '@/components/UnderConstruction'

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <UnderConstruction 
        title="Permintaan Produk"
        description="Fitur permintaan produk dari kasir sedang dalam pengembangan. Anda akan dapat melihat dan mengelola permintaan stok dari cabang."
      />
    </ProtectedRoute>
  )
}
