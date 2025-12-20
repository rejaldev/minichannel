'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsAPI } from '@/lib/api';
import { getAuth } from '@/lib/auth';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = getAuth();

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const res = await productsAPI.getProduct(params.id as string);
      setProduct(res.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Produk tidak ditemukan');
      router.push('/dashboard/products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus produk ini? Data tidak bisa dikembalikan!')) {
      return;
    }

    try {
      await productsAPI.deleteProduct(params.id as string);
      alert('Produk berhasil dihapus!');
      router.push('/dashboard/products');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(error.response?.data?.message || 'Gagal menghapus produk');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <button
            onClick={() => router.back()}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium mb-2 flex items-center text-sm md:text-base"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">{product.category?.name}</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <a
            href={`/dashboard/products/${product.id}/edit`}
            className="flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-3 bg-slate-600 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 font-medium text-center text-sm md:text-base transition"
          >
            Edit Produk
          </a>
          <button
            onClick={handleDelete}
            className="flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-3 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 font-medium text-sm md:text-base transition"
          >
            Hapus
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">Informasi Produk</h2>
          
          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Nama Produk</label>
              <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">{product.name}</p>
            </div>

            <div>
              <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Deskripsi</label>
              <p className="text-sm md:text-base text-gray-900 dark:text-gray-300">{product.description || '-'}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Kategori</label>
                <p className="text-sm md:text-base text-gray-900 dark:text-white">{product.category?.name}</p>
              </div>
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Range Harga</label>
                {(() => {
                  // Get all prices from all stocks across all variants
                  const prices: number[] = [];
                  product.variants?.forEach((v: any) => {
                    v.stocks?.forEach((s: any) => {
                      if (s.price) prices.push(s.price);
                    });
                  });
                  
                  if (prices.length === 0) {
                    return <p className="text-xl md:text-2xl font-bold text-slate-600 dark:text-slate-400">-</p>;
                  }
                  
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);
                  return (
                    <p className="text-xl md:text-2xl font-bold text-slate-600 dark:text-slate-400">
                      {minPrice === maxPrice 
                        ? `Rp ${minPrice.toLocaleString('id-ID')}`
                        : `Rp ${minPrice.toLocaleString('id-ID')} - ${maxPrice.toLocaleString('id-ID')}`
                      }
                    </p>
                  );
                })()}
              </div>
            </div>

            <div>
              <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
              <p className="mt-1">
                <span
                  className={`px-2 md:px-3 py-0.5 md:py-1 text-xs md:text-sm font-semibold rounded-full ${
                    product.isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}
                >
                  {product.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-500 to-slate-600 dark:from-slate-700 dark:to-slate-800 rounded-xl shadow-lg p-4 md:p-6 text-white">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Ringkasan</h3>
          <div className="space-y-3 md:space-y-4">
            <div>
              <p className="text-slate-100 text-xs md:text-sm">Total Varian</p>
              <p className="text-2xl md:text-3xl font-bold">{product.variants?.length || 0}</p>
            </div>
            <div>
              <p className="text-slate-100 text-xs md:text-sm">Total Stok (Semua Cabang)</p>
              <p className="text-2xl md:text-3xl font-bold">
                {product.variants?.reduce((total: number, v: any) => {
                  return total + (v.stocks?.reduce((sum: number, s: any) => sum + s.quantity, 0) || 0);
                }, 0) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Variants & Stock */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">Varian & Stok</h2>
        
        {product.variants && product.variants.length > 0 ? (
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Varian
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    SKU
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Harga
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Cabang
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Stok
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {product.variants.map((variant: any) => (
                  variant.stocks?.map((stock: any) => (
                    <tr key={`${variant.id}-${stock.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                          {variant.variantValue}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-mono">{variant.sku}</div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Rp {stock.price.toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{stock.cabang?.name}</div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="text-base md:text-lg font-bold text-gray-900 dark:text-white">{stock.quantity}</div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        {stock.quantity <= 5 ? (
                          <span className="px-2 py-0.5 md:py-1 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                            Menipis
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 md:py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                            Aman
                          </span>
                        )}
                      </td>
                    </tr>
                  )) || (
                    <tr key={variant.id}>
                      <td colSpan={6} className="px-3 md:px-6 py-4 text-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        Belum ada stok untuk varian ini
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6 md:py-8 text-sm md:text-base">Belum ada varian untuk produk ini</p>
        )}
      </div>
    </div>
  );
}
