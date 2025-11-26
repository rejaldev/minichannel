'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import UnderConstruction from '@/components/UnderConstruction'

export default function OpnamePage() {
  return (
    <ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'ADMIN']}>
      <UnderConstruction 
        title="Stok Opname"
        description="Fitur stok opname sedang dalam pengembangan. Anda akan dapat melakukan penghitungan dan audit stok secara sistematis."
      />
    </ProtectedRoute>
  )
}
