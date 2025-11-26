'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsAPI, cabangAPI } from '@/lib/api';
import { getAuth } from '@/lib/auth';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cabangs, setCabangs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const { user } = getAuth();
  
  // Expandable rows for variant products
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  
  // Inline stock adjustment
  const [editingStock, setEditingStock] = useState<{
    variantId: string;
    cabangId: string;
    currentQty: number;
    position: { x: number; y: number };
  } | null>(null);
  const [newStockQty, setNewStockQty] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [savingStock, setSavingStock] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, search]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, cabangsRes] = await Promise.all([
        productsAPI.getProducts({
          categoryId: selectedCategory || undefined,
          search: search || undefined,
          isActive: true, // Only fetch active products
        }),
        productsAPI.getCategories(),
        cabangAPI.getCabangs(),
      ]);

      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setCabangs(cabangsRes.data.filter((c: any) => c.isActive));
      setSelectedProducts([]); // Reset selection after fetch
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      alert('Pilih produk yang ingin dihapus');
      return;
    }

    if (!confirm(`Yakin ingin menghapus ${selectedProducts.length} produk? Data tidak bisa dikembalikan!`)) {
      return;
    }

    setDeleting(true);
    const productsToDelete = [...selectedProducts]; // Store before clear
    
    try {
      const results = await Promise.allSettled(
        productsToDelete.map(id => productsAPI.deleteProduct(id))
      );
      
      const failed = results.filter(r => r.status === 'rejected');
      const success = results.filter(r => r.status === 'fulfilled');
      
      if (failed.length > 0) {
        console.error('Failed deletions:', failed);
        alert(`Berhasil menghapus ${success.length} produk. ${failed.length} produk gagal dihapus.`);
      } else {
        alert(`${productsToDelete.length} produk berhasil dihapus!`);
      }
      
      // Immediately remove deleted products from UI
      setProducts(prevProducts => prevProducts.filter(p => !productsToDelete.includes(p.id)));
      setSelectedProducts([]);
      
    } catch (error: any) {
      console.error('Error deleting products:', error);
      alert(error.response?.data?.error || 'Gagal menghapus produk');
    } finally {
      setDeleting(false);
    }
  };

  const handleStockClick = (e: React.MouseEvent, variantId: string, cabangId: string, currentQty: number) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setEditingStock({
      variantId,
      cabangId,
      currentQty,
      position: { x: rect.left, y: rect.bottom + 8 }
    });
    setNewStockQty(currentQty.toString());
    setAdjustmentReason('');
  };

  const handleSaveStock = async () => {
    if (!editingStock) return;
    
    const qty = parseInt(newStockQty);
    if (isNaN(qty) || qty < 0) {
      alert('Masukkan jumlah stok yang valid (>= 0)');
      return;
    }

    setSavingStock(true);
    try {
      // Call API to update stock with reason logging
      await productsAPI.updateStock(
        editingStock.variantId,
        editingStock.cabangId,
        { 
          quantity: qty,
          reason: adjustmentReason || undefined,
          notes: adjustmentReason === 'Lainnya' ? 'Custom adjustment' : undefined
        }
      );

      // Update local state
      setProducts(prevProducts => prevProducts.map(product => ({
        ...product,
        variants: product.variants?.map((variant: any) => {
          if (variant.id === editingStock.variantId) {
            return {
              ...variant,
              stocks: variant.stocks?.map((stock: any) => 
                stock.cabangId === editingStock.cabangId
                  ? { ...stock, quantity: qty }
                  : stock
              )
            };
          }
          return variant;
        })
      })));

      setEditingStock(null);
      setNewStockQty('');
      setAdjustmentReason('');
      
      // Show success message
      alert(`✓ Stok berhasil diupdate menjadi ${qty}${adjustmentReason ? ` (${adjustmentReason})` : ''}`);
    } catch (error: any) {
      console.error('Error updating stock:', error);
      alert(error.response?.data?.error || 'Gagal update stok');
    } finally {
      setSavingStock(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingStock(null);
    setNewStockQty('');
    setAdjustmentReason('');
  };

  const toggleExpandProduct = (productId: string) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6">
      {/* Breadcrumb + Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <button onClick={() => router.push('/dashboard')} className="hover:text-gray-900 dark:hover:text-white transition">
            Home
          </button>
          <span>›</span>
          <span className="font-semibold text-gray-900 dark:text-white">Kelola Produk</span>
        </nav>
        <button
          onClick={() => router.push('/dashboard/products/new')}
          className="inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg hover:shadow-xl text-xs sm:text-sm font-medium whitespace-nowrap"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Produk
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="mb-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {selectedProducts.length} produk dipilih
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-medium disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {deleting ? 'Menghapus...' : `Hapus ${selectedProducts.length} Produk`}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-slate-900/20 rounded-xl md:rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 p-4 md:p-6 mb-6 md:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Cari Produk
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nama produk atau SKU..."
              className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg md:rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg md:rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat._count?.products || 0})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table/List */}
      {products.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 md:p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Tidak ada produk</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Mulai dengan menambahkan produk baru.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop: Table View */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
                  <tr>
                    <th scope="col" className="w-12 px-4 py-4" rowSpan={2}>
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === products.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-5 w-5 text-slate-600 focus:ring-slate-500 border-gray-300 rounded cursor-pointer"
                      />
                    </th>
                    <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider" rowSpan={2}>
                      Produk
                    </th>
                    <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider" rowSpan={2}>
                      Kategori
                    </th>
                    <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider" rowSpan={2}>
                      Tipe
                    </th>
                    {cabangs.map((cabang) => (
                      <th key={cabang.id} scope="col" colSpan={2} className="px-4 py-2 text-center text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-l border-gray-300 dark:border-gray-600">
                        {cabang.name}
                      </th>
                    ))}
                    <th scope="col" className="px-4 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider border-l border-gray-300 dark:border-gray-600" rowSpan={2}>
                      Status
                    </th>
                  </tr>
                  <tr>
                    {cabangs.map((cabang) => (
                      <React.Fragment key={cabang.id}>
                        <th key={`${cabang.id}-stock`} className="px-2 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-l border-gray-300 dark:border-gray-600">
                          Stok
                        </th>
                        <th key={`${cabang.id}-price`} className="px-2 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300">
                          Harga
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {products.map((product, index) => {
                    const totalStock = product.productType === 'SINGLE'
                      ? product.stocks?.reduce((sum: number, s: any) => sum + s.quantity, 0) || 0
                      : product.variants?.reduce((sum: number, v: any) => 
                          sum + (v.stocks?.reduce((vSum: number, s: any) => vSum + s.quantity, 0) || 0), 0
                        ) || 0;
                    const variantCount = product.variants?.length || 0;
                    
                    return (
                      <React.Fragment key={product.id}>
                        <tr 
                          className={`hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors ${
                            index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                          }`}
                        >
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                            className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-gray-300 rounded cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2 max-w-md">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded flex items-center justify-center">
                              <span className="text-slate-600 dark:text-slate-300 font-bold text-sm">
                                {product.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => router.push(`/dashboard/products/${product.id}`)}
                                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-slate-600 dark:hover:text-slate-400 line-clamp-1 text-left transition-colors"
                                >
                                  {product.name}
                                </button>
                                <button
                                  onClick={() => router.push(`/dashboard/products/${product.id}`)}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                                  title="View"
                                >
                                  <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                                  className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors flex-shrink-0"
                                  title="Edit"
                                >
                                  <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              </div>
                              {product.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {product.category?.name || '-'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          {product.productType === 'VARIANT' ? (
                            <button
                              onClick={() => toggleExpandProduct(product.id)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors hover:ring-2 hover:ring-purple-300 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300`}
                            >
                              <svg 
                                className={`w-3 h-3 transition-transform ${expandedProducts.has(product.id) ? 'rotate-90' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              Varian ({variantCount})
                            </button>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              Tunggal
                            </span>
                          )}
                        </td>
                        {/* Per-Cabang Stock & Price */}
                        {product.productType === 'SINGLE' ? (
                          // SINGLE Product - Show stock directly with edit capability
                          cabangs.map((cabang) => {
                            const variant = product.variants?.[0];
                            const stock = variant?.stocks?.find((s: any) => s.cabangId === cabang.id);
                            const stockQty = stock?.quantity || 0;
                            const stockPrice = stock?.price || 0;
                            const variantId = variant?.id;

                            return (
                              <React.Fragment key={cabang.id}>
                                <td className="px-2 py-2.5 text-center border-l border-gray-200 dark:border-gray-700">
                                  {variantId ? (
                                    <button
                                      onClick={(e) => handleStockClick(e, variantId, cabang.id, stockQty)}
                                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold hover:ring-2 hover:ring-offset-1 transition-all cursor-pointer ${
                                        stockQty <= 5
                                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:ring-red-400'
                                          : stockQty <= 20
                                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:ring-yellow-400'
                                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:ring-green-400'
                                      }`}
                                      title="Klik untuk edit stok"
                                    >
                                      {stockQty}
                                    </button>
                                  ) : (
                                    <span className="text-xs text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-2 py-2.5 text-right">
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {stockPrice > 0 ? `Rp ${stockPrice.toLocaleString('id-ID')}` : '-'}
                                  </span>
                                </td>
                              </React.Fragment>
                            );
                          })
                        ) : (
                          // VARIANT Product - Show total stock (not editable)
                          cabangs.map((cabang) => {
                            let stockQty = 0;
                            let stockPrice = 0;
                            
                            product.variants?.forEach((variant: any) => {
                              const stock = variant.stocks?.find((s: any) => s.cabangId === cabang.id);
                              stockQty += stock?.quantity || 0;
                              if (stock?.price && (stockPrice === 0 || stock.price < stockPrice)) {
                                stockPrice = stock.price;
                              }
                            });

                            return (
                              <React.Fragment key={cabang.id}>
                                <td className="px-2 py-2.5 text-center border-l border-gray-200 dark:border-gray-700">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold ${
                                    stockQty <= 5
                                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                      : stockQty <= 20
                                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  }`}>
                                    {stockQty}
                                  </span>
                                </td>
                                <td className="px-2 py-2.5 text-right">
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {stockPrice > 0 ? `Rp ${stockPrice.toLocaleString('id-ID')}` : '-'}
                                  </span>
                                </td>
                              </React.Fragment>
                            );
                          })
                        )}
                        <td className="px-3 py-2.5 text-center border-l border-gray-200 dark:border-gray-700">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.isActive
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {product.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        </tr>

                        {/* Variant Sub-rows */}
                        {product.productType === 'VARIANT' && expandedProducts.has(product.id) && product.variants?.map((variant: any, vIndex: number) => (
                        <tr 
                          key={`${product.id}-${variant.id}`}
                          className="bg-purple-50/30 dark:bg-purple-900/10 border-l-4 border-purple-300 dark:border-purple-700"
                        >
                          <td className="px-3 py-2"></td>
                          <td className="px-3 py-2 pl-12" colSpan={3}>
                            <div className="flex items-center gap-2">
                              <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {variant.variantName}: <span className="font-bold text-purple-700 dark:text-purple-400">{variant.variantValue}</span>
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                (SKU: {variant.sku})
                              </span>
                            </div>
                          </td>
                          {/* Per-Cabang Stock for this variant */}
                          {cabangs.map((cabang) => {
                            const stock = variant.stocks?.find((s: any) => s.cabangId === cabang.id);
                            const stockQty = stock?.quantity || 0;
                            const stockPrice = stock?.price || 0;

                            return (
                              <React.Fragment key={cabang.id}>
                                <td className="px-2 py-2 text-center border-l border-gray-200 dark:border-gray-700">
                                  <button
                                    onClick={(e) => handleStockClick(e, variant.id, cabang.id, stockQty)}
                                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold hover:ring-2 hover:ring-offset-1 transition-all cursor-pointer ${
                                      stockQty <= 5
                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:ring-red-400'
                                        : stockQty <= 20
                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:ring-yellow-400'
                                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:ring-green-400'
                                    }`}
                                    title="Klik untuk edit stok"
                                  >
                                    {stockQty}
                                  </button>
                                </td>
                                <td className="px-2 py-2 text-right">
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {stockPrice > 0 ? `Rp ${stockPrice.toLocaleString('id-ID')}` : '-'}
                                  </span>
                                </td>
                              </React.Fragment>
                            );
                          })}
                          <td className="px-3 py-2 border-l border-gray-200 dark:border-gray-700"></td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: Card View */}
          <div className="md:hidden space-y-3">
            {products.map((product) => {
              const totalStock = product.productType === 'SINGLE'
                ? product.stocks?.reduce((sum: number, s: any) => sum + s.quantity, 0) || 0
                : product.variants?.reduce((sum: number, v: any) => 
                    sum + (v.stocks?.reduce((vSum: number, s: any) => vSum + s.quantity, 0) || 0), 0
                  ) || 0;
              const variantCount = product.variants?.length || 0;
              
              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
                >
                  {/* Header with checkbox and status */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                        className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-gray-300 rounded cursor-pointer"
                      />
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        product.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {product.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      product.productType === 'SINGLE'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    }`}>
                      {product.productType === 'SINGLE' ? 'Tunggal' : `${variantCount} Varian`}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="p-3 space-y-2.5">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {product.description || '-'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {product.category?.name || '-'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        totalStock <= 5
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          : totalStock <= 20
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      }`}>
                        Total: {totalStock}
                      </span>
                    </div>
                    
                    {/* Per-Cabang Stock & Price (Mobile) */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Stok & Harga per Cabang</p>
                      {cabangs.map((cabang) => {
                        let stockQty = 0;
                        let stockPrice = 0;

                        if (product.productType === 'SINGLE') {
                          const variant = product.variants?.[0];
                          const stock = variant?.stocks?.find((s: any) => s.cabangId === cabang.id);
                          stockQty = stock?.quantity || 0;
                          stockPrice = stock?.price || 0;
                        } else {
                          product.variants?.forEach((variant: any) => {
                            const stock = variant.stocks?.find((s: any) => s.cabangId === cabang.id);
                            stockQty += stock?.quantity || 0;
                            if (stock?.price && (stockPrice === 0 || stock.price < stockPrice)) {
                              stockPrice = stock.price;
                            }
                          });
                        }

                        return (
                          <div key={cabang.id} className="flex items-center justify-between py-1 px-2 bg-gray-50 dark:bg-gray-700/30 rounded">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {cabang.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                stockQty <= 5
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                  : stockQty <= 20
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              }`}>
                                {stockQty}
                              </span>
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {stockPrice > 0 ? `Rp ${stockPrice.toLocaleString('id-ID')}` : '-'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex border-t border-gray-200 dark:border-gray-700 divide-x divide-gray-200 dark:divide-gray-700">
                    <button
                      onClick={() => router.push(`/dashboard/products/${product.id}`)}
                      className="flex-1 flex items-center justify-center py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-xs font-medium">Detail</span>
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                      className="flex-1 flex items-center justify-center py-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-xs font-medium">Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Inline Stock Edit Popup */}
      {editingStock && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={handleCancelEdit}
          />
          
          {/* Popup Modal */}
          <div
            className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-slate-300 dark:border-slate-600 p-4 w-72"
            style={{
              left: `${editingStock.position.x}px`,
              top: `${editingStock.position.y}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="space-y-3">
              {/* Title */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Edit Stok
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Current stock info */}
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Stok saat ini: <span className="font-bold text-gray-900 dark:text-white">{editingStock.currentQty}</span>
              </div>

              {/* New stock input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Stok Baru
                </label>
                <input
                  type="number"
                  min="0"
                  value={newStockQty}
                  onChange={(e) => setNewStockQty(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="0"
                  autoFocus
                />
              </div>

              {/* Reason dropdown/input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Alasan (opsional)
                </label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                >
                  <option value="">- Pilih atau skip -</option>
                  <option value="Stok opname">Stok opname</option>
                  <option value="Barang rusak">Barang rusak</option>
                  <option value="Barang hilang">Barang hilang</option>
                  <option value="Return supplier">Return supplier</option>
                  <option value="Koreksi input">Koreksi input</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={savingStock}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  ✗ Batal
                </button>
                <button
                  onClick={handleSaveStock}
                  disabled={savingStock}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 rounded-lg transition-all disabled:opacity-50"
                >
                  {savingStock ? 'Menyimpan...' : '✓ Simpan'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
