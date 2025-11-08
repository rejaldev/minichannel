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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-800 font-medium mb-2 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600 mt-1">{product.category?.name}</p>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href={`/dashboard/products/${product.id}/edit`}
            className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium"
          >
            Edit Produk
          </a>
          <button
            onClick={handleDelete}
            className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium"
          >
            Hapus
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Produk</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Nama Produk</label>
              <p className="text-lg font-semibold text-gray-900">{product.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Deskripsi</label>
              <p className="text-gray-900">{product.description || '-'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Kategori</label>
                <p className="text-gray-900">{product.category?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Range Harga</label>
                {(() => {
                  const prices = product.variants?.map((v: any) => v.price) || [];
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);
                  return (
                    <p className="text-2xl font-bold text-slate-600">
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
              <label className="text-sm font-medium text-gray-600">Status</label>
              <p>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    product.isActive
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {product.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Ringkasan</h3>
          <div className="space-y-4">
            <div>
              <p className="text-slate-100 text-sm">Total Varian</p>
              <p className="text-3xl font-bold">{product.variants?.length || 0}</p>
            </div>
            <div>
              <p className="text-slate-100 text-sm">Total Stok (Semua Cabang)</p>
              <p className="text-3xl font-bold">
                {product.variants?.reduce((total: number, v: any) => {
                  return total + (v.stocks?.reduce((sum: number, s: any) => sum + s.quantity, 0) || 0);
                }, 0) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Variants & Stock */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Varian & Stok</h2>
        
        {product.variants && product.variants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Varian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cabang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stok Tersedia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Min. Stok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {product.variants.map((variant: any) => (
                  variant.stocks?.map((stock: any) => (
                    <tr key={`${variant.id}-${stock.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {variant.variantName}: {variant.variantValue}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 font-mono">{variant.sku}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-600">
                          Rp {variant.price.toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{stock.cabang?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-gray-900">{stock.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{stock.minStock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {stock.quantity <= stock.minStock ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                            Stok Menipis
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Aman
                          </span>
                        )}
                      </td>
                    </tr>
                  )) || (
                    <tr key={variant.id}>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        Belum ada stok untuk varian ini
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">Belum ada varian untuk produk ini</p>
        )}
      </div>
    </div>
  );
}
