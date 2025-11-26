'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import UnderConstruction from '@/components/UnderConstruction'

export default function ApprovalsPage() {
  return (
    <ProtectedRoute>
      <UnderConstruction 
        title="Approval Transfer"
        description="Fitur approval transfer stok sedang dalam pengembangan. Anda akan dapat menyetujui atau menolak permintaan transfer dari admin cabang."
      />
    </ProtectedRoute>
  )
}
