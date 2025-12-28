'use client';

import { useState, useEffect } from 'react';
import { stockTransfersAPI, cabangAPI, productsAPI } from '@/lib/api';
import { getAuth } from '@/lib/auth';
import { 
  ArrowLeftRight, 
  Plus, 
  Check, 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Package,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';

interface Transfer {
  id: string;
  transferNo: string;
  quantity: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  productVariant: {
    id: string;
    variantName: string;
    variantValue: string;
    sku: string;
    product: {
      id: string;
      name: string;
    };
  };
  fromCabang: {
    id: string;
    name: string;
  };
  toCabang: {
    id: string;
    name: string;
  };
  transferredBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface Cabang {
  id: string;
  name: string;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  variants: Array<{
    id: string;
    variantName: string;
    variantValue: string;
    sku: string;
    stocks: Array<{
      cabangId: string;
      quantity: number;
    }>;
  }>;
}

interface Stats {
  total: number;
  completed: number;
  pending: number;
  totalQuantity: number;
}

export default function StockTransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Cabang[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [cabangFilter, setCabangFilter] = useState<string>('');
  
  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [fromCabang, setFromCabang] = useState('');
  const [toCabang, setToCabang] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');
  
  // Action loading
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const { user } = getAuth();
  const canApprove = user?.role === 'MANAGER' || user?.role === 'OWNER';
  const canCreate = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'OWNER';

  useEffect(() => {
    fetchData();
  }, [statusFilter, cabangFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (cabangFilter) params.cabangId = cabangFilter;
      
      const [transfersRes, statsRes, branchesRes] = await Promise.all([
        stockTransfersAPI.getTransfers(params),
        stockTransfersAPI.getStats(),
        cabangAPI.getCabangs()
      ]);
      
      setTransfers(transfersRes.data);
      setStats(statsRes.data);
      setBranches(branchesRes.data.filter((b: Cabang) => b.isActive));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (search: string) => {
    if (!search || search.length < 2) {
      setProducts([]);
      return;
    }
    
    try {
      const res = await productsAPI.getProducts({ search, isActive: true });
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleCreateTransfer = async () => {
    if (!selectedVariant || !fromCabang || !toCabang || quantity <= 0) {
      alert('Please fill all required fields');
      return;
    }
    
    try {
      setCreateLoading(true);
      await stockTransfersAPI.createTransfer({
        variantId: selectedVariant,
        fromCabangId: fromCabang,
        toCabangId: toCabang,
        quantity,
        notes: notes || undefined
      });
      
      setShowCreateModal(false);
      resetCreateForm();
      fetchData();
      
      // Show appropriate message based on role
      if (canApprove) {
        alert('✅ Transfer berhasil dibuat dan langsung diproses!');
      } else {
        alert('✅ Request transfer berhasil dikirim!\nMenunggu approval dari Manager/Owner.');
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Gagal membuat transfer');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Approve transfer ini? Stock akan langsung dipindahkan.')) return;
    
    try {
      setActionLoading(id);
      await stockTransfersAPI.approveTransfer(id);
      fetchData();
      alert('✅ Transfer approved!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Gagal approve transfer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Alasan reject (opsional):');
    if (reason === null) return; // User cancelled
    
    try {
      setActionLoading(id);
      await stockTransfersAPI.rejectTransfer(id, reason);
      fetchData();
      alert('Transfer dibatalkan');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Gagal reject transfer');
    } finally {
      setActionLoading(null);
    }
  };

  const resetCreateForm = () => {
    setSearchProduct('');
    setSelectedProduct(null);
    setSelectedVariant('');
    setFromCabang('');
    setToCabang('');
    setQuantity(1);
    setNotes('');
    setProducts([]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const getAvailableStock = () => {
    if (!selectedProduct || !selectedVariant || !fromCabang) return 0;
    const variant = selectedProduct.variants.find(v => v.id === selectedVariant);
    if (!variant) return 0;
    const stock = variant.stocks.find(s => s.cabangId === fromCabang);
    return stock?.quantity || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <a href="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition">Dashboard</a>
        <span>›</span>
        <a href="/dashboard/stock" className="hover:text-gray-900 dark:hover:text-white transition">Stock</a>
        <span>›</span>
        <span className="text-gray-900 dark:text-white font-medium">Transfer</span>
      </nav>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Transfer</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total || 0}</p>
            </div>
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <ArrowLeftRight className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats?.pending || 0}</p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.completed || 0}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalQuantity || 0}</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Daftar Transfer</h2>
            
            {canCreate && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Transfer</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          
          <select
            value={cabangFilter}
            onChange={(e) => setCabangFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Semua Cabang</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Transfer No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">From → To</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Requested By</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                {canApprove && <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={canApprove ? 8 : 7} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>Belum ada transfer</p>
                  </td>
                </tr>
              ) : (
                transfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-gray-900 dark:text-white">{transfer.transferNo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {transfer.productVariant.product.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {transfer.productVariant.variantValue} • {transfer.productVariant.sku}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-900 dark:text-white">{transfer.fromCabang.name}</span>
                        <ArrowLeftRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{transfer.toCabang.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-gray-900 dark:text-white">{transfer.quantity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">{transfer.transferredBy.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{transfer.transferredBy.role}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(transfer.status)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transfer.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </td>
                    {canApprove && (
                      <td className="px-4 py-3">
                        {transfer.status === 'PENDING' && (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleApprove(transfer.id)}
                              disabled={actionLoading === transfer.id}
                              className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(transfer.id)}
                              disabled={actionLoading === transfer.id}
                              className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Buat Transfer Stock</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {canApprove 
                  ? 'Transfer akan langsung diproses' 
                  : 'Transfer akan menunggu approval dari Manager/Owner'}
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Product Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cari Produk *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchProduct}
                    onChange={(e) => {
                      setSearchProduct(e.target.value);
                      fetchProducts(e.target.value);
                    }}
                    placeholder="Ketik nama produk atau SKU..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                {/* Product Results */}
                {products.length > 0 && !selectedProduct && (
                  <div className="mt-2 border border-gray-200 dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto">
                    {products.map(product => (
                      <button
                        key={product.id}
                        onClick={() => {
                          setSelectedProduct(product);
                          setSearchProduct(product.name);
                          setProducts([]);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">{product.name}</span>
                        <span className="text-xs text-gray-500">({product.variants.length} variant)</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Variant Selection */}
              {selectedProduct && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pilih Variant *
                  </label>
                  <select
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">-- Pilih Variant --</option>
                    {selectedProduct.variants.map(variant => (
                      <option key={variant.id} value={variant.id}>
                        {variant.variantValue} ({variant.sku})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* From Cabang */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dari Cabang *
                </label>
                <select
                  value={fromCabang}
                  onChange={(e) => setFromCabang(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">-- Pilih Cabang Asal --</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>

              {/* To Cabang */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ke Cabang *
                </label>
                <select
                  value={toCabang}
                  onChange={(e) => setToCabang(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">-- Pilih Cabang Tujuan --</option>
                  {branches.filter(b => b.id !== fromCabang).map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>

              {/* Stock Info & Quantity */}
              {selectedVariant && fromCabang && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Stok Tersedia:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{getAvailableStock()}</span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Jumlah Transfer *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={getAvailableStock()}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  {quantity > getAvailableStock() && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Jumlah melebihi stok tersedia!</span>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catatan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Tambahkan catatan..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCreateTransfer}
                disabled={createLoading || !selectedVariant || !fromCabang || !toCabang || quantity <= 0 || quantity > getAvailableStock()}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {createLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>{canApprove ? 'Transfer' : 'Request Transfer'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
