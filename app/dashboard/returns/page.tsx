'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import UnderConstruction from '@/components/UnderConstruction'

export default function ReturnsPage() {
  return (
    <ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'ADMIN', 'KASIR']}>
      <UnderConstruction 
        title="Retur Penjualan"
        description="Fitur retur dan refund sedang dalam pengembangan. Anda akan dapat mengelola pengembalian produk dengan mudah."
      />
    </ProtectedRoute>
  )
}
