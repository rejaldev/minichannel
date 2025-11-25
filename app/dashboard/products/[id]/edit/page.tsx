'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsAPI, categoriesAPI, cabangAPI } from '@/lib/api';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategory] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [productType, setProductType] = useState<'SINGLE' | 'VARIANT'>('VARIANT');
  const [price, setPrice] = useState<number>(0);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [cabangs, setCabangs] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [bulkApply, setBulkApply] = useState({
    sku: '',
    price: '',
    stock: ''
  });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const [productRes, categoriesRes, cabangsRes] = await Promise.all([
        productsAPI.getProduct(params.id as string),
        categoriesAPI.getCategories(),
        cabangAPI.getCabangs(),
      ]);

      const product = productRes.data;
      setName(product.name);
      setDescription(product.description || '');
      setCategory(product.categoryId);
      setIsActive(product.isActive);
      setProductType(product.productType || 'VARIANT');
      setPrice(product.price || 0);
      
      // Transform variants for editing (include price)
      const variantsData = product.variants.map((v: any) => ({
        id: v.id,
        variantName: v.variantName,
        variantValue: v.variantValue,
        sku: v.sku,
        price: parseFloat(v.price) || 0, // Ensure it's a number
        stocks: cabangsRes.data.map((cabang: any) => {
          const existingStock = v.stocks?.find((s: any) => s.cabangId === cabang.id);
          return {
            cabangId: cabang.id,
            cabangName: cabang.name,
            quantity: existingStock?.quantity || 0,
          };
        }),
      }));
      
      setVariants(variantsData);
      setCategories(categoriesRes.data);
      setCabangs(cabangsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Gagal memuat data produk');
      router.push('/dashboard/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        variantName: '',
        variantValue: '',
        sku: '',
        price: 0,
        stocks: cabangs.map((cabang) => ({
          cabangId: cabang.id,
          cabangName: cabang.name,
          quantity: 0,
        })),
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleProductTypeChange = (newType: 'SINGLE' | 'VARIANT') => {
    setProductType(newType);
    
    if (newType === 'SINGLE' && variants.length === 0) {
      // Create default variant for SINGLE product
      setVariants([{
        variantName: 'Default',
        variantValue: 'Standard',
        sku: name.toUpperCase().replace(/\s+/g, '-') + '-01',
        price: price || 0,
        stocks: cabangs.map((cabang) => ({
          cabangId: cabang.id,
          cabangName: cabang.name,
          quantity: 0,
        })),
      }]);
    }
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const updated = [...variants];
    // Convert to number for price field
    if (field === 'price') {
      const numValue = parseFloat(value) || 0;
      updated[index][field] = numValue;
    } else {
      updated[index][field] = value;
    }
    setVariants(updated);
  };

  const handleStockChange = (variantIndex: number, cabangIndex: number, field: string, value: string) => {
    setVariants(prevVariants => {
      const updated = prevVariants.map((variant, vIdx) => {
        if (vIdx === variantIndex) {
          return {
            ...variant,
            stocks: variant.stocks.map((stock: any, sIdx: number) => {
              if (sIdx === cabangIndex) {
                return {
                  ...stock,
                  [field]: parseInt(value) || 0
                };
              }
              return stock;
            })
          };
        }
        return variant;
      });
      return updated;
    });
  };

  const applyBulkValues = () => {
    const updated = variants.map((v, index) => ({
      ...v,
      ...(bulkApply.sku && { sku: `${bulkApply.sku}${index + 1}` }),
      ...(bulkApply.price && { price: parseFloat(bulkApply.price) || v.price }),
      ...(bulkApply.stock && {
        stocks: v.stocks.map((s: any) => ({
          ...s,
          quantity: parseInt(bulkApply.stock) || s.quantity
        }))
      })
    }));
    setVariants(updated);
    setBulkApply({ sku: '', price: '', stock: '' });
    alert(`✓ Nilai berhasil diterapkan ke ${variants.length} varian!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !categoryId) {
      alert('Nama dan kategori wajib diisi!');
      return;
    }

    // Validation based on product type
    if (productType === 'SINGLE') {
      if (!price || price <= 0) {
        alert('Harga produk harus diisi!');
        return;
      }
    } else {
      // VARIANT validation
      if (variants.length === 0) {
        alert('Minimal harus ada 1 varian!');
        return;
      }

      for (const variant of variants) {
        if (!variant.variantName || !variant.variantValue || !variant.sku) {
          alert('Semua varian harus lengkap (Nama, Value, SKU)!');
          return;
        }
        if (!variant.price || variant.price <= 0) {
          alert('Semua varian harus punya harga yang valid!');
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const updateData: any = {
        name,
        description,
        categoryId,
        isActive,
        productType,
      };

      if (productType === 'SINGLE') {
        updateData.price = price;
        // Single product may have a default variant
        if (variants.length > 0) {
          updateData.variants = variants.map((v) => ({
            id: v.id,
            variantName: v.variantName || 'Default',
            variantValue: v.variantValue || 'Standard',
            sku: v.sku,
            price: price, // Sync with product price
            stocks: v.stocks.map((s: any) => ({
              cabangId: s.cabangId,
              quantity: s.quantity,
              minStock: s.minStock,
            })),
          }));
        }
      } else {
        // VARIANT product
        updateData.variants = variants.map((v) => ({
          id: v.id,
          variantName: v.variantName,
          variantValue: v.variantValue,
          sku: v.sku,
          price: parseFloat(v.price),
          stocks: v.stocks,
        }));
      }

      await productsAPI.updateProduct(params.id as string, updateData);

      alert('Produk berhasil diupdate!');
      router.push(`/dashboard/products/${params.id}`);
    } catch (error: any) {
      console.error('Error updating product:', error);
      alert(error.response?.data?.message || 'Gagal update produk');
    } finally {
      setSubmitting(false);
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
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-slate-600 hover:text-slate-800 font-medium mb-2 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Produk</h2>
          
          {/* Product Type Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipe Produk *
            </label>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => handleProductTypeChange('SINGLE')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  productType === 'SINGLE'
                    ? 'bg-slate-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Produk Single
              </button>
              <button
                type="button"
                onClick={() => handleProductTypeChange('VARIANT')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  productType === 'VARIANT'
                    ? 'bg-slate-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Produk Variant
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {productType === 'SINGLE' 
                ? 'Produk dengan harga tunggal tanpa variasi'
                : 'Produk dengan multiple varian (ukuran, warna, dll)'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nama Produk *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kategori *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
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
                Status
              </label>
              <select
                value={isActive ? 'true' : 'false'}
                onChange={(e) => setIsActive(e.target.value === 'true')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
            />
          </div>

          {/* Single Product Price */}
          {productType === 'SINGLE' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Harga Produk *
              </label>
              <input
                type="number"
                value={price || ''}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="50000"
                min="0"
                step="any"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Harga ini akan diterapkan ke semua varian</p>
            </div>
          )}
        </div>

        {/* Stock Management for SINGLE products */}
        {productType === 'SINGLE' && variants.length > 0 && variants[0].stocks && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Stok per Cabang</h2>
            <div className="space-y-3">
              {variants[0].stocks.map((stock: any, stockIndex: number) => (
                <div key={`stock-${stockIndex}-${stock.cabangId}`} className="grid grid-cols-2 gap-4 items-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">
                    {stock.cabangName}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Jumlah Stok</label>
                    <input
                      type="number"
                      value={variants[0].stocks[stockIndex]?.quantity || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/^0+/, '') || '0'; // Remove leading zeros
                        handleStockChange(0, stockIndex, 'quantity', val);
                      }}
                      onBlur={(e) => {
                        // Ensure proper number format on blur
                        const num = parseInt(e.target.value) || 0;
                        handleStockChange(0, stockIndex, 'quantity', String(num));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder="Jumlah"
                      min="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Variants - Only show for VARIANT type */}
        {productType === 'VARIANT' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Varian Produk</h2>
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm font-medium"
            >
              + Tambah Varian
            </button>
          </div>

          {/* Bulk Apply Form - Always visible */}
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Terapkan ke Semua Varian</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  SKU Prefix
                </label>
                <input
                  type="text"
                  value={bulkApply.sku}
                  onChange={(e) => setBulkApply({...bulkApply, sku: e.target.value})}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                  placeholder="e.g., PRD-"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Stok (ke semua cabang)
                </label>
                <input
                  type="number"
                  value={bulkApply.stock}
                  onChange={(e) => setBulkApply({...bulkApply, stock: e.target.value})}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  value={bulkApply.price}
                  onChange={(e) => setBulkApply({...bulkApply, price: e.target.value})}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                  placeholder="50000"
                  min="0"
                  step="any"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={applyBulkValues}
                  className="w-full px-4 py-1.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm font-medium"
                >
                  Terapkan
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              SKU akan menambahkan nomor urut (e.g., PRD-1, PRD-2). Kosongkan field yang tidak ingin diubah.
            </p>
          </div>

          

          {variants.map((variant, variantIndex) => (
            <div key={variantIndex} className="mb-4 p-4 md:p-5 border-2 border-gray-200 rounded-xl bg-white hover:border-slate-300 transition-colors">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-slate-600 text-white rounded-lg font-bold text-sm">
                    {variantIndex + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Varian #{variantIndex + 1}</h3>
                    <p className="text-xs text-gray-500">
                      {variant.variantName && variant.variantValue 
                        ? `${variant.variantName}: ${variant.variantValue}` 
                        : 'Belum diisi'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(variantIndex)}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-colors"
                >
                  Hapus
                </button>
              </div>

              {/* Variant Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Nama Varian
                      </span>
                    </label>
                    <input
                      type="text"
                      value={variant.variantName}
                      onChange={(e) => handleVariantChange(variantIndex, 'variantName', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="e.g., Nomor, Size, Ukuran"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Value
                      </span>
                    </label>
                    <input
                      type="text"
                      value={variant.variantValue}
                      onChange={(e) => handleVariantChange(variantIndex, 'variantValue', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="e.g., 13, M, XL"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        SKU
                      </span>
                    </label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(variantIndex, 'sku', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="e.g., VAR-009"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Harga <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                        Rp
                      </span>
                      <input
                        type="number"
                        value={variant.price || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/^0+(?=\d)/, '');
                          handleVariantChange(variantIndex, 'price', val);
                        }}
                        onBlur={(e) => {
                          const num = parseFloat(e.target.value) || 0;
                          handleVariantChange(variantIndex, 'price', String(num));
                        }}
                        className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        placeholder="50000"
                        min="0"
                        step="any"
                      />
                    </div>
                  </div>
                </div>

                {/* Stock Section */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Stok per Cabang
                    </span>
                  </label>
                  <div className="space-y-2">
                    {variant.stocks.map((stock: any, stockIndex: number) => (
                      <div key={stockIndex} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700 truncate">
                              {stock.cabangName}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 w-24">
                          <input
                            type="number"
                            value={stock.quantity || ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/^0+/, '') || '0';
                              handleStockChange(variantIndex, stockIndex, 'quantity', val);
                            }}
                            onBlur={(e) => {
                              const num = parseInt(e.target.value) || 0;
                              handleStockChange(variantIndex, stockIndex, 'quantity', String(num));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center font-semibold focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {variants.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Belum ada varian. Klik tombol "Tambah Varian" untuk menambahkan.
            </p>
          )}
        </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium disabled:opacity-50"
          >
            {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}
