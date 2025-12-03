'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { ordersAPI, categoriesAPI } from '@/lib/api'
import { getAuth } from '@/lib/auth'

interface Order {
  id: string
  orderNo: string
  productName: string
  productType: string
  categoryName?: string
  price?: number
  quantity?: number
  status: string
  notes?: string
  rejectionReason?: string
  createdAt: string
  processedAt?: string
  requestedBy: { name: string; email: string }
  cabang: { name: string }
  processedBy?: { name: string }
}

interface Category {
  id: string
  name: string
}

export default function OrdersPage() {
  const router = useRouter()
  const { user } = getAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    productName: '',
    productType: 'SINGLE',
    categoryId: '',
    categoryName: '',
    price: '',
    quantity: '',
    notes: ''
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadOrders()
    loadCategories()
  }, [user, router])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await ordersAPI.getOrders()
      setOrders(response.data)
    } catch (error) {
      console.error('Failed to load orders:', error)
      alert('Gagal memuat data permintaan produk')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories()
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.productName.trim()) {
      alert('Nama produk harus diisi')
      return
    }

    try {
      const data: any = {
        productName: formData.productName,
        productType: formData.productType,
        notes: formData.notes || undefined
      }

      if (formData.categoryId) {
        data.categoryId = formData.categoryId
        const category = categories.find(c => c.id === formData.categoryId)
        data.categoryName = category?.name
      }

      if (formData.price) {
        data.price = parseFloat(formData.price)
      }

      if (formData.quantity) {
        data.quantity = parseInt(formData.quantity)
      }

      await ordersAPI.createOrder(data)
      alert('Permintaan produk berhasil dibuat')
      setShowForm(false)
      setFormData({
        productName: '',
        productType: 'SINGLE',
        categoryId: '',
        categoryName: '',
        price: '',
        quantity: '',
        notes: ''
      })
      loadOrders()
    } catch (error: any) {
      console.error('Failed to create order:', error)
      alert(error.response?.data?.error || 'Gagal membuat permintaan produk')
    }
  }

  const handleDelete = async (orderId: string) => {
    if (!confirm('Yakin ingin menghapus permintaan ini?')) return

    try {
      await ordersAPI.deleteOrder(orderId)
      alert('Permintaan berhasil dihapus')
      loadOrders()
    } catch (error: any) {
      console.error('Failed to delete order:', error)
      alert(error.response?.data?.error || 'Gagal menghapus permintaan')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    }
    const labels = {
      PENDING: 'Menunggu',
      APPROVED: 'Disetujui',
      REJECTED: 'Ditolak'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Permintaan Produk</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Tutup Form' : '+ Request Produk Baru'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Request Produk Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nama Produk *
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tipe Produk
                  </label>
                  <select
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="SINGLE">Single (Tanpa Varian)</option>
                    <option value="VARIANT">Variant (Ada Varian)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Harga (Opsional)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Quantity (Opsional)</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Catatan</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Deskripsi produk, spesifikasi, dll..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Kirim Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-500">Belum ada permintaan produk</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Order No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Produk</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Kategori</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Harga</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Qty</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Tanggal</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{order.orderNo}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{order.productName}</div>
                      {order.notes && (
                        <div className="text-xs text-gray-500">{order.notes}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{order.categoryName || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {order.price ? `Rp ${order.price.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{order.quantity || '-'}</td>
                    <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      {order.status === 'PENDING' && user?.role === 'KASIR' && (
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Hapus
                        </button>
                      )}
                      {order.status === 'REJECTED' && (
                        <div className="text-xs text-red-600">
                          {order.rejectionReason}
                        </div>
                      )}
                      {order.status === 'APPROVED' && order.processedBy && (
                        <div className="text-xs text-green-600">
                          Disetujui oleh {order.processedBy.name}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
