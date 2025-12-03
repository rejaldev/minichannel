'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { returnsAPI } from '@/lib/api'
import { getAuth } from '@/lib/auth'

interface ReturnItem {
  id: string
  productName: string
  variantInfo: string
  sku: string
  quantity: number
  price: number
  subtotal: number
}

interface Return {
  id: string
  returnNo: string
  createdAt: string
  status: 'PENDING' | 'REJECTED' | 'COMPLETED'
  reason: string
  notes: string
  subtotal: number
  refundAmount: number
  refundMethod: string
  approvedBy: string | null
  approvedAt: string | null
  transaction: {
    transactionNo: string
    customerName: string | null
    customerPhone: string | null
    paymentMethod: string
    total: number
    createdAt: string
  }
  cabang: {
    id: string
    name: string
  }
  processedBy: {
    id: string
    name: string
    role: string
  }
  items: ReturnItem[]
}

interface Stats {
  pending: number
  rejected: number
  completed: number
  total: number
  totalRefundAmount: number
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [actionNotes, setActionNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' })

  useEffect(() => {
    fetchReturns()
    fetchStats()
  }, [statusFilter, searchQuery, dateFilter])

  const fetchReturns = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (statusFilter !== 'ALL') params.status = statusFilter
      if (searchQuery) params.search = searchQuery
      if (dateFilter.startDate) params.startDate = dateFilter.startDate
      if (dateFilter.endDate) params.endDate = dateFilter.endDate
      
      const response = await returnsAPI.getReturns(params)
      setReturns(response.data.returns)
    } catch (error) {
      alert('Gagal memuat data return')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await returnsAPI.getStats()
      setStats(response.data)
    } catch (error) {
      // Stats fetch failed - UI will handle gracefully
    }
  }

  const handleApprove = async () => {
    if (!selectedReturn) return
    
    const { user } = getAuth()
    if (!user) {
      alert('User tidak terautentikasi')
      return
    }
    
    try {
      setProcessing(true)
      await returnsAPI.approveReturn(selectedReturn.id, {
        approvedBy: user.id,
        notes: actionNotes
      })
      alert('Return berhasil disetujui!')
      setShowApproveModal(false)
      setShowDetailModal(false)
      setActionNotes('')
      fetchReturns()
      fetchStats()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Gagal menyetujui return')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedReturn) return
    
    const { user } = getAuth()
    if (!user) {
      alert('User tidak terautentikasi')
      return
    }
    
    try {
      setProcessing(true)
      await returnsAPI.rejectReturn(selectedReturn.id, {
        rejectedBy: user.id,
        rejectionNotes: actionNotes
      })
      alert('Return berhasil ditolak')
      setShowRejectModal(false)
      setShowDetailModal(false)
      setActionNotes('')
      fetchReturns()
      fetchStats()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Gagal menolak return')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }
    
    const labels = {
      PENDING: 'Menunggu',
      REJECTED: 'Ditolak',
      COMPLETED: 'Selesai'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Retur & Refund
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola permintaan retur dari kasir
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">Selesai</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">Ditolak</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Refund</p>
              <p className="text-lg font-bold text-purple-600">{formatCurrency(stats.totalRefundAmount)}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="ALL">Semua Status</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Selesai</option>
                <option value="REJECTED">Ditolak</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cari
              </label>
              <input
                type="text"
                placeholder="No Return / No Transaksi"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Returns Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Memuat data...</p>
            </div>
          ) : returns.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">Tidak ada data return</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      No Return
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Transaksi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Kasir
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cabang
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Refund
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {returns.map((returnItem) => (
                    <tr key={returnItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {returnItem.returnNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {returnItem.transaction.transactionNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(returnItem.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {returnItem.processedBy.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {returnItem.cabang.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(returnItem.refundAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(returnItem.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedReturn(returnItem)
                            setShowDetailModal(true)
                          }}
                          className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedReturn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Detail Return
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedReturn.returnNo}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Transaction Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Informasi Transaksi
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">No Transaksi</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedReturn.transaction.transactionNo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tanggal Transaksi</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedReturn.transaction.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Kasir</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedReturn.processedBy.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cabang</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedReturn.cabang.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Metode Pembayaran</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedReturn.transaction.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedReturn.status)}</div>
                    </div>
                  </div>
                </div>

                {/* Return Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Item yang Diretur
                  </h3>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Produk</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">SKU</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Qty</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Harga</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedReturn.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {item.productName}
                              <br />
                              <span className="text-xs text-gray-500">{item.variantInfo}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.sku}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{formatCurrency(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                            Total Refund:
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-lg text-purple-600">
                            {formatCurrency(selectedReturn.refundAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Return Reason & Notes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Alasan Return
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Alasan:</p>
                    <p className="font-medium text-gray-900 dark:text-white mb-3">{selectedReturn.reason}</p>
                    {selectedReturn.notes && (
                      <>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Catatan:</p>
                        <p className="text-gray-900 dark:text-white">{selectedReturn.notes}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {selectedReturn.status === 'PENDING' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowApproveModal(true)
                        setShowDetailModal(false)
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                    >
                      Setujui Return
                    </button>
                    <button
                      onClick={() => {
                        setShowRejectModal(true)
                        setShowDetailModal(false)
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
                    >
                      Tolak Return
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Approve Modal */}
        {showApproveModal && selectedReturn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Konfirmasi Persetujuan Return
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Anda akan menyetujui return <strong>{selectedReturn.returnNo}</strong> dengan total refund <strong>{formatCurrency(selectedReturn.refundAmount)}</strong>. 
                  Stok akan dikembalikan ke cabang {selectedReturn.cabang.name}.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Tambahkan catatan..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowApproveModal(false)
                      setShowDetailModal(true)
                      setActionNotes('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    disabled={processing}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50"
                    disabled={processing}
                  >
                    {processing ? 'Memproses...' : 'Ya, Setujui'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedReturn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Konfirmasi Penolakan Return
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Anda akan menolak return <strong>{selectedReturn.returnNo}</strong>. Mohon berikan alasan penolakan.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alasan Penolakan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Berikan alasan penolakan..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false)
                      setShowDetailModal(true)
                      setActionNotes('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    disabled={processing}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50"
                    disabled={processing || !actionNotes.trim()}
                  >
                    {processing ? 'Memproses...' : 'Ya, Tolak'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
