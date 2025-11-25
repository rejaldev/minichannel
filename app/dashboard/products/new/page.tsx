'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productsAPI } from '@/lib/api';
import DynamicVariantBuilder from '@/components/DynamicVariantBuilder';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDynamicBuilder, setShowDynamicBuilder] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    productType: 'VARIANT' as 'SINGLE' | 'VARIANT',
    price: 0,
    sku: '',
    stock: 0,
  });
  const [variants, setVariants] = useState<Array<{ variantName: string; variantValue: string; sku: string; price: number; stock: number }>>([
    { variantName: '', variantValue: '', sku: '', price: 0, stock: 0 },
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
    setVariants([...variants, { variantName: '', variantValue: '', sku: '', price: 0, stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleGeneratedVariants = (generated: Array<{ variantName: string; variantValue: string; sku: string; price: string; stock: string }>) => {
    const converted = generated.map(v => ({
      variantName: v.variantName,
      variantValue: v.variantValue,
      sku: v.sku,
      price: parseFloat(v.price) || 0,
      stock: parseInt(v.stock) || 0
    }));
    setVariants(converted);
    setShowDynamicBuilder(false);
    alert(`✓ ${generated.length} varian berhasil di-generate!`);
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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
        <a href="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition">
          Home
        </a>
        <span>›</span>
        <a href="/dashboard/products" className="hover:text-gray-900 dark:hover:text-white transition">
          Kelola Produk
        </a>
        <span>›</span>
        <span className="font-semibold text-gray-900 dark:text-white">Tambah Produk Baru</span>
      </nav>

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

            <div className="grid grid-cols-1 gap-4">
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
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, productType: 'SINGLE' })}
                    className={`px-3 py-2.5 rounded-lg border-2 font-medium transition-all text-sm ${
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
                    className={`px-3 py-2.5 rounded-lg border-2 font-medium transition-all text-sm ${
                      formData.productType === 'VARIANT'
                        ? 'border-slate-500 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    Produk Varian
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {formData.productType === 'SINGLE' 
                    ? 'Produk tanpa varian (contoh: Pulpen merek X)' 
                    : 'Produk dengan varian (contoh: Baju SD nomor 6, 8, 10)'}
                </p>
              </div>
            </div>

            {/* Show price and SKU input only for SINGLE product */}
            {formData.productType === 'SINGLE' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku || ''}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                      placeholder="Contoh: SERAGAM-SD-06"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Harga <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">Rp</span>
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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                        placeholder="50000"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stok Awal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+(?=\d)/, '');
                      setFormData({ ...formData, stock: parseInt(val) || 0 });
                    }}
                    onBlur={(e) => {
                      const num = parseInt(e.target.value) || 0;
                      setFormData({ ...formData, stock: num });
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    placeholder="15"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Jumlah stok produk yang tersedia</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Variants - Only show for VARIANT product type */}
        {formData.productType === 'VARIANT' && (
          <>
            {/* Dynamic Variant Builder */}
            {showDynamicBuilder ? (
              <div className="space-y-4">
                <DynamicVariantBuilder 
                  onGenerate={handleGeneratedVariants}
                  existingVariants={variants.length > 0 ? variants : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowDynamicBuilder(false)}
                  className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                >
                  ✕ Tutup Generator
                </button>
              </div>
            ) : variants.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="space-y-3 mb-4">
                  <div className="text-center">
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDynamicBuilder(true)}
                    className="w-full px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Buka Variant</span>
                  </button>
                </div>
          
          {/* Header for desktop */}
          <div className="hidden md:grid md:grid-cols-[1.5fr_1.3fr_1.2fr_1fr_1.1fr_auto] gap-2 mb-2 px-1">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Nama Varian</div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Nilai</div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">SKU</div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Stok</div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Harga</div>
            <div className="w-10"></div>
          </div>
          
          <div className="space-y-2.5">
            {variants.map((variant, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 md:p-0 md:border-0 md:bg-transparent md:grid md:grid-cols-[1.5fr_1.3fr_1.2fr_1fr_1.1fr_auto] md:gap-2 md:items-center space-y-2 md:space-y-0">
                {/* Row 1: Varian Name + Value (Mobile: side by side) */}
                <div className="grid grid-cols-2 gap-2 md:block md:space-y-1">
                  <div>
                    <label className="md:hidden block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">Nama</label>
                    <input
                      type="text"
                      value={variant.variantName}
                      onChange={(e) => updateVariant(index, 'variantName', e.target.value)}
                      placeholder="Ukuran"
                      className="w-full px-2.5 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    />
                  </div>
                  <div className="md:hidden">
                    <label className="block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">Nilai</label>
                    <input
                      type="text"
                      value={variant.variantValue}
                      onChange={(e) => updateVariant(index, 'variantValue', e.target.value)}
                      placeholder="6"
                      className="w-full px-2.5 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    />
                  </div>
                </div>
                
                {/* Desktop only: Separate Value field */}
                <div className="hidden md:block space-y-1">
                  <input
                    type="text"
                    value={variant.variantValue}
                    onChange={(e) => updateVariant(index, 'variantValue', e.target.value)}
                    placeholder="Contoh: 6 / Merah"
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                  />
                </div>
                
                {/* Row 2: SKU + Stock + Price (Mobile: 3 columns) */}
                <div className="grid grid-cols-3 gap-2 md:contents">
                  <div className="md:space-y-1">
                    <label className="md:hidden block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">SKU</label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      placeholder="001"
                      className="w-full px-2.5 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-xs font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    />
                  </div>
                  <div className="md:space-y-1">
                    <label className="md:hidden block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">Stok</label>
                    <input
                      type="number"
                      value={variant.stock || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/^0+(?=\d)/, '');
                        updateVariant(index, 'stock', val);
                      }}
                      onBlur={(e) => {
                        const num = parseInt(e.target.value) || 0;
                        updateVariant(index, 'stock', String(num));
                      }}
                      placeholder="15"
                      min="0"
                      className="w-full px-2.5 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    />
                  </div>
                  <div className="md:space-y-1">
                    <label className="md:hidden block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">Harga</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-[10px]">Rp</span>
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
                        placeholder="50000"
                        min="0"
                        className="w-full pl-7 pr-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Delete button */}
                <div className="md:flex md:items-end -mx-3 -mb-3 mt-2 md:m-0">
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="w-full md:w-10 h-9 md:h-10 flex items-center justify-center gap-1.5 text-red-600 hover:text-white hover:bg-red-600 bg-red-50 dark:bg-red-900/20 md:bg-transparent border-t md:border border-red-200 md:border-red-300 hover:border-red-600 rounded-b-lg md:rounded-lg transition-all duration-150 font-medium text-xs md:text-base"
                    title="Hapus varian"
                  >
                    <span className="text-lg leading-none">×</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setShowDynamicBuilder(true)}
              className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm font-medium transition flex items-center justify-center gap-2"
            >
              Generate Ulang
            </button>
            <button
              type="button"
              onClick={addVariant}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm font-medium transition flex items-center gap-1"
            >
              <span className="text-lg leading-none">+</span>
              Tambah 1 Varian
            </button>
          </div>
        </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Belum Ada Varian</h3>
                <button
                  type="button"
                  onClick={() => setShowDynamicBuilder(true)}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2 mx-auto"
                >
                  Buka Generator
                </button>
              </div>
            )}
          </>
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
