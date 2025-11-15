'use client';

import { useEffect, useState } from 'react';
import { productsAPI } from '@/lib/api';
import { getAuth } from '@/lib/auth';

export default function ProductsPage() {
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
      await Promise.all(
        selectedProducts.map(id => productsAPI.deleteProduct(id))
      );
      alert(`${selectedProducts.length} produk berhasil dihapus!`);
      fetchData();
    } catch (error: any) {
      console.error('Error deleting products:', error);
      alert('Gagal menghapus beberapa produk');
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
          <a href="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition">
            Home
          </a>
          <span>›</span>
          <span className="font-semibold text-gray-900 dark:text-white">Kelola Produk</span>
        </nav>
        <a
          href="/dashboard/products/new"
          className="inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg hover:shadow-xl text-xs sm:text-sm font-medium whitespace-nowrap"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Produk
        </a>
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

      {/* Products Grid */}
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
          {/* Select All */}
          <div className="flex items-center mb-4 bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-4">
            <input
              type="checkbox"
              checked={selectedProducts.length === products.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="h-4 w-4 md:h-5 md:w-5 text-slate-600 focus:ring-slate-500 border-gray-300 rounded cursor-pointer"
            />
            <label className="ml-2 md:ml-3 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
              Pilih Semua ({products.length} produk)
            </label>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className="flex items-start space-x-2 md:space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                      className="h-4 w-4 md:h-5 md:w-5 text-slate-600 focus:ring-slate-500 border-gray-300 rounded cursor-pointer mt-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <h3 className="text-base md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
                        {product.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{product.description}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-semibold ${
                      product.isActive
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {product.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <div className="mb-3 md:mb-4">
                  <span className="inline-block px-2 md:px-3 py-1 md:py-1.5 text-xs font-semibold bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-full shadow-sm">
                    {product.category?.name}
                  </span>
                </div>

                <div className="mb-4 md:mb-5 pb-3 md:pb-4 border-b border-gray-100 dark:border-gray-700">
                  {(() => {
                    if (product.productType === 'SINGLE') {
                      return (
                        <p className="text-xl md:text-3xl font-bold text-slate-700 dark:text-slate-300">
                          Rp {product.price?.toLocaleString('id-ID')}
                        </p>
                      );
                    } else {
                      const prices = product.variants?.map((v: any) => v.price) || [];
                      const minPrice = Math.min(...prices);
                      const maxPrice = Math.max(...prices);
                      return (
                        <p className="text-xl md:text-3xl font-bold text-slate-700 dark:text-slate-300">
                          {minPrice === maxPrice 
                            ? `Rp ${minPrice.toLocaleString('id-ID')}`
                            : `Rp ${minPrice.toLocaleString('id-ID')} - ${maxPrice.toLocaleString('id-ID')}`
                          }
                        </p>
                      );
                    }
                  })()}
                </div>

                {/* Variants Summary */}
                <div className="mb-4 md:mb-5">
                  <p className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 md:mb-3">
                    {product.variants?.length || 0} Varian
                  </p>
                  {product.variants && product.variants.length > 0 && (
                    <div className="space-y-1.5 md:space-y-2 max-h-28 md:max-h-32 overflow-y-auto">
                      {product.variants.slice(0, 3).map((variant: any) => {
                        const totalStock = variant.stocks?.reduce(
                          (sum: number, s: any) => sum + s.quantity,
                          0
                        ) || 0;
                        const isLowStock = totalStock <= (variant.stocks?.[0]?.minStock || 5);
                        return (
                          <div
                            key={variant.id}
                            className="flex items-center justify-between text-xs md:text-sm bg-gray-50 dark:bg-gray-700 p-1.5 md:p-2 rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-gray-700 dark:text-gray-200 font-medium block truncate">
                                {variant.variantName}: {variant.variantValue}
                              </span>
                              <span className="ml-0 md:ml-2 text-xs text-blue-600 dark:text-blue-400 font-semibold block md:inline">
                                Rp {variant.price?.toLocaleString('id-ID')}
                              </span>
                            </div>
                            <span className={`font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-md text-xs md:text-sm ${
                              isLowStock
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                            }`}>
                              {totalStock}
                            </span>
                          </div>
                        );
                      })}
                      {product.variants.length > 3 && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          +{product.variants.length - 3} varian lainnya
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <a
                    href={`/dashboard/products/${product.id}`}
                    className="flex-1 text-center px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-lg md:rounded-xl hover:from-slate-600 hover:to-slate-700 transition-all text-xs md:text-sm font-semibold shadow-sm hover:shadow-md"
                  >
                    Detail
                  </a>
                  <a
                    href={`/dashboard/products/${product.id}/edit`}
                    className="flex-1 text-center px-3 md:px-4 py-2 md:py-2.5 bg-gray-100 text-gray-700 rounded-lg md:rounded-xl hover:bg-gray-200 transition-all text-xs md:text-sm font-semibold"
                  >
                    Edit
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
