'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import UnderConstruction from '@/components/UnderConstruction'

export default function BranchesPage() {
  return (
    <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
      <UnderConstruction 
        title="Manajemen Cabang"
        description="Fitur manajemen cabang sedang dalam pengembangan. Anda akan dapat mengelola informasi dan pengaturan setiap cabang toko."
      />
    </ProtectedRoute>
  )
}
