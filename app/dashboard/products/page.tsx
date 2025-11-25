'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsAPI } from '@/lib/api';
import { getAuth } from '@/lib/auth';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const { user } = getAuth();

  useEffect(() => {
    fetchData();
  }, [selectedCategory, search]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getProducts({
          categoryId: selectedCategory || undefined,
          search: search || undefined,
        }),
        productsAPI.getCategories(),
      ]);

      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
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
    try {
      const results = await Promise.allSettled(
        selectedProducts.map(id => productsAPI.deleteProduct(id))
      );
      
      const failed = results.filter(r => r.status === 'rejected');
      const success = results.filter(r => r.status === 'fulfilled');
      
      if (failed.length > 0) {
        console.error('Failed deletions:', failed);
        alert(`Berhasil menghapus ${success.length} produk. ${failed.length} produk gagal dihapus.`);
      } else {
        alert(`${selectedProducts.length} produk berhasil dihapus!`);
      }
      
      // Remove deleted products from UI immediately
      setProducts(products.filter(p => !selectedProducts.includes(p.id)));
      setSelectedProducts([]);
      
      // Then fetch fresh data from server
      await fetchData();
    } catch (error: any) {
      console.error('Error deleting products:', error);
      alert(error.response?.data?.error || 'Gagal menghapus produk');
    } finally {
      setDeleting(false);
    }
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
                    <th scope="col" className="w-12 px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === products.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-5 w-5 text-slate-600 focus:ring-slate-500 border-gray-300 rounded cursor-pointer"
                      />
                    </th>
                    <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Produk
                    </th>
                    <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Tipe
                    </th>
                    <th scope="col" className="px-4 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Harga
                    </th>
                    <th scope="col" className="px-4 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Stok
                    </th>
                    <th scope="col" className="px-4 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Aksi
                    </th>
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
                      <tr 
                        key={product.id} 
                        className={`hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors ${
                          index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                        }`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                            className="h-5 w-5 text-slate-600 focus:ring-slate-500 border-gray-300 rounded cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center">
                              <span className="text-slate-600 dark:text-slate-300 font-bold text-lg">
                                {product.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {product.description || '-'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {product.category?.name || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              product.productType === 'SINGLE'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            }`}>
                              {product.productType === 'SINGLE' ? 'Tunggal' : `Varian (${variantCount})`}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {(() => {
                            if (product.productType === 'SINGLE') {
                              return (
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                  Rp {product.price?.toLocaleString('id-ID')}
                                </p>
                              );
                            } else {
                              const prices = product.variants?.map((v: any) => v.price) || [];
                              const minPrice = Math.min(...prices);
                              const maxPrice = Math.max(...prices);
                              return (
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                  {minPrice === maxPrice 
                                    ? `Rp ${minPrice.toLocaleString('id-ID')}`
                                    : `Rp ${minPrice.toLocaleString('id-ID')} - ${maxPrice.toLocaleString('id-ID')}`
                                  }
                                </p>
                              );
                            }
                          })()}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                            totalStock <= 5
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              : totalStock <= 20
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          }`}>
                            {totalStock}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            product.isActive
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {product.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => router.push(`/dashboard/products/${product.id}`)}
                              className="inline-flex items-center px-3 py-1.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all text-xs font-medium"
                              title="Lihat Detail"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-xs font-medium"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
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
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
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
                        Stok: {totalStock}
                      </span>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      {(() => {
                        if (product.productType === 'SINGLE') {
                          return (
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                              Rp {product.price?.toLocaleString('id-ID')}
                            </p>
                          );
                        } else {
                          const prices = product.variants?.map((v: any) => v.price) || [];
                          const minPrice = Math.min(...prices);
                          const maxPrice = Math.max(...prices);
                          return (
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                              {minPrice === maxPrice 
                                ? `Rp ${minPrice.toLocaleString('id-ID')}`
                                : `Rp ${minPrice.toLocaleString('id-ID')} - ${maxPrice.toLocaleString('id-ID')}`
                              }
                            </p>
                          );
                        }
                      })()}
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
    </div>
  );
}
