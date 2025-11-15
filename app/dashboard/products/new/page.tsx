'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productsAPI } from '@/lib/api';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    productType: 'VARIANT' as 'SINGLE' | 'VARIANT',
    price: 0,
    sku: '',
  });
  const [variants, setVariants] = useState<Array<{ variantName: string; variantValue: string; sku: string; price: number }>>([
    { variantName: '', variantValue: '', sku: '', price: 0 },
  ]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await productsAPI.getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const addVariant = () => {
    setVariants([...variants, { variantName: '', variantValue: '', sku: '', price: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        productType: formData.productType,
      };

      if (formData.productType === 'SINGLE') {
        payload.price = Number(formData.price);
        payload.sku = formData.sku;
      } else {
        payload.variants = variants.filter(v => v.variantName && v.variantValue && v.price > 0);
      }

      await productsAPI.createProduct(payload);

      alert('Produk berhasil ditambahkan!');
      router.push('/dashboard/products');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Gagal menambahkan produk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi Produk</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nama Produk *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Contoh: Baju Seragam SD Putih"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deskripsi
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Deskripsi produk..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategori *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipe Produk *
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, productType: 'SINGLE' })}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                      formData.productType === 'SINGLE'
                        ? 'border-slate-500 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    Produk Tunggal
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, productType: 'VARIANT' })}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                      formData.productType === 'VARIANT'
                        ? 'border-slate-500 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    Produk Varian
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.productType === 'SINGLE' 
                    ? 'Produk tanpa varian (contoh: Pulpen merek X)' 
                    : 'Produk dengan varian (contoh: Baju SD nomor 6, 8, 10)'}
                </p>
              </div>
            </div>

            {/* Show price and SKU input only for SINGLE product */}
            {formData.productType === 'SINGLE' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="SKU"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Harga *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+(?=\d)/, '');
                      setFormData({ ...formData, price: parseFloat(val) || 0 });
                    }}
                    onBlur={(e) => {
                      const num = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, price: num });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="50000"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Variants - Only show for VARIANT product type */}
        {formData.productType === 'VARIANT' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Varian Produk</h2>
            <button
              type="button"
              onClick={addVariant}
              className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 text-sm font-medium"
            >
              + Tambah Varian
            </button>
          </div>
          <div className="space-y-3">
            {variants.map((variant, index) => (
              <div key={index} className="grid gap-2" style={{ gridTemplateColumns: '2.5fr 1.2fr 1.5fr 1.5fr 40px' }}>
                <input
                  type="text"
                  value={variant.variantName}
                  onChange={(e) => updateVariant(index, 'variantName', e.target.value)}
                  placeholder="Variant Produk"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  value={variant.variantValue}
                  onChange={(e) => updateVariant(index, 'variantValue', e.target.value)}
                  placeholder="Warna / Ukuran"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  value={variant.sku}
                  onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                  placeholder="SKU"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 text-xs font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="number"
                  value={variant.price || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/^0+(?=\d)/, '');
                    updateVariant(index, 'price', val);
                  }}
                  onBlur={(e) => {
                    const num = parseFloat(e.target.value) || 0;
                    updateVariant(index, 'price', String(num));
                  }}
                  placeholder="Harga"
                  min="0"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {variants.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-xl"
                  >
                    ×
                  </button>
                ) : (
                  <div className="w-10"></div>
                )}
              </div>
            ))}
          </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 disabled:bg-gray-300"
          >
            {loading ? 'Menyimpan...' : 'Simpan Produk'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
