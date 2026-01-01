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
  const [variantTypes, setVariantTypes] = useState({
    type1: '',
    type2: '',
    type3: ''
  });
  const [attributeCount, setAttributeCount] = useState<1 | 2 | 3>(1);
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
      
      // Transform variants for editing (include price per cabang and marketplace fields)
      const variantsData = product.variants.map((v: any) => ({
        id: v.id,
        variantName: v.variantName,
        variantValue: v.variantValue,
        sku: v.sku,
        weight: v.weight || '',
        length: v.length || '',
        width: v.width || '',
        height: v.height || '',
        imageUrl: v.imageUrl || '',
        stocks: cabangsRes.data.map((cabang: any) => {
          const existingStock = v.stocks?.find((s: any) => s.cabangId === cabang.id);
          return {
            cabangId: cabang.id,
            cabangName: cabang.name,
            quantity: existingStock?.quantity || 0,
            price: existingStock?.price || 0,
          };
        }),
      }));
      
      setVariants(variantsData);
      setCategories(categoriesRes.data);
      setCabangs(cabangsRes.data);
      
      // Extract variant types from first variant
      if (variantsData.length > 0 && variantsData[0].variantName) {
        const types = variantsData[0].variantName.split(' | ');
        setVariantTypes({
          type1: types[0] || '',
          type2: types[1] || '',
          type3: types[2] || ''
        });
        // Set attribute count based on existing types
        const count = types.filter((t: string) => t && t !== 'Default').length;
        setAttributeCount(Math.max(1, Math.min(3, count)) as 1 | 2 | 3);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Gagal memuat data produk');
      router.push('/dashboard/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = () => {
    // Auto-generate variantName from defined types based on attributeCount
    const typesArray = [variantTypes.type1];
    if (attributeCount >= 2) typesArray.push(variantTypes.type2);
    if (attributeCount >= 3) typesArray.push(variantTypes.type3);
    const types = typesArray.filter(t => t).join(' | ');
    setVariants([
      ...variants,
      {
        variantName: types || 'Default',
        variantValue: '',
        sku: '',
        weight: '',
        length: '',
        width: '',
        height: '',
        imageUrl: '',
        stocks: cabangs.map((cabang) => ({
          cabangId: cabang.id,
          cabangName: cabang.name,
          quantity: 0,
          price: 0,
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
        stocks: cabangs.map((cabang) => ({
          cabangId: cabang.id,
          cabangName: cabang.name,
          quantity: 0,
          price: price || 0, // Price per cabang
        })),
      }]);
    }
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const updated = [...variants];
    updated[index][field] = value;
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
                // Handle both quantity and price fields
                if (field === 'price') {
                  return {
                    ...stock,
                    [field]: parseFloat(value) || 0
                  };
                } else {
                  return {
                    ...stock,
                    [field]: parseInt(value) || 0
                  };
                }
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
      ...(bulkApply.stock && {
        stocks: v.stocks.map((s: any) => ({
          ...s,
          quantity: parseInt(bulkApply.stock) || s.quantity
        }))
      }),
      ...(bulkApply.price && {
        stocks: v.stocks.map((s: any) => ({
          ...s,
          price: parseFloat(bulkApply.price) || s.price
        }))
      })
    }));
    setVariants(updated);
    setBulkApply({ sku: '', price: '', stock: '' });
    alert(`Nilai berhasil diterapkan ke ${variants.length} varian!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !categoryId) {
      alert('Nama dan kategori wajib diisi!');
      return;
    }

    // Validation based on product type
    if (productType === 'SINGLE') {
      // Validate SINGLE product has default variant with stocks
      if (variants.length === 0 || !variants[0].stocks || variants[0].stocks.length === 0) {
        alert('Produk harus punya harga dan stok minimal di 1 cabang!');
        return;
      }
      const hasPrice = variants[0].stocks.some((s: any) => s.price && s.price > 0);
      if (!hasPrice) {
        alert('Harga produk harus diisi minimal di 1 cabang!');
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
        // Validate that at least one cabang has a price
        const hasPrice = variant.stocks.some((s: any) => s.price && s.price > 0);
        if (!hasPrice) {
          alert(`Varian "${variant.variantName}: ${variant.variantValue}" harus punya harga minimal di 1 cabang!`);
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

      // Send variants with stocks and marketplace fields
      if (variants.length > 0) {
        updateData.variants = variants.map((v) => ({
          id: v.id,
          variantName: v.variantName || 'Default',
          variantValue: v.variantValue || 'Standard',
          sku: v.sku,
          weight: v.weight ? parseInt(v.weight) : null,
          length: v.length ? parseInt(v.length) : null,
          width: v.width ? parseInt(v.width) : null,
          height: v.height ? parseInt(v.height) : null,
          imageUrl: v.imageUrl || null,
          stocks: v.stocks.map((s: any) => ({
            cabangId: s.cabangId,
            quantity: s.quantity,
            price: s.price
          })),
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
    <div className="max-w-5xl mx-auto px-4">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium mb-2 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Informasi Produk</h2>
          
          {/* Product Type Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipe Produk *
            </label>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => handleProductTypeChange('SINGLE')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  productType === 'SINGLE'
                    ? 'bg-slate-600 dark:bg-slate-700 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Produk Single
              </button>
              <button
                type="button"
                onClick={() => handleProductTypeChange('VARIANT')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  productType === 'VARIANT'
                    ? 'bg-slate-600 dark:bg-slate-700 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Produk Variant
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
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

            {/* SKU for SINGLE products only */}
            {productType === 'SINGLE' && variants.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  value={variants[0].sku || ''}
                  onChange={(e) => {
                    const newVariants = [...variants];
                    newVariants[0].sku = e.target.value;
                    setVariants(newVariants);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Contoh: PROD-001"
                />
              </div>
            )}
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
        </div>

        {/* Stock Management for SINGLE products */}
        {productType === 'SINGLE' && variants.length > 0 && variants[0].stocks && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Harga & Stok per Cabang</h2>
            <div className="space-y-3">
              {variants[0].stocks.map((stock: any, stockIndex: number) => (
                <div key={`stock-${stockIndex}-${stock.cabangId}`} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stock.cabangName}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Harga</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={variants[0].stocks[stockIndex]?.price ? Number(variants[0].stocks[stockIndex].price).toLocaleString('id-ID') : ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '');
                          handleStockChange(0, stockIndex, 'price', val);
                        }}
                        onBlur={(e) => {
                          const num = parseFloat(e.target.value.replace(/\./g, '')) || 0;
                          handleStockChange(0, stockIndex, 'price', String(num));
                        }}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="50.000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Jumlah Stok</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={variants[0].stocks[stockIndex]?.quantity || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '').replace(/^0+/, '') || '0';
                        handleStockChange(0, stockIndex, 'quantity', val);
                      }}
                      onBlur={(e) => {
                        const num = parseInt(e.target.value) || 0;
                        handleStockChange(0, stockIndex, 'quantity', String(num));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Jumlah"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Variants - Only show for VARIANT type */}
        {productType === 'VARIANT' && (
        <>
          {/* Variant Type Definition */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Definisi Tipe Varian
              </h3>
              <div className="flex items-center gap-1">
                {attributeCount > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setAttributeCount((prev) => Math.max(1, prev - 1) as 1 | 2 | 3);
                      if (attributeCount === 3) setVariantTypes(v => ({ ...v, type3: '' }));
                      if (attributeCount === 2) setVariantTypes(v => ({ ...v, type2: '' }));
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition text-lg font-bold"
                    title="Kurangi tipe"
                  >
                    −
                  </button>
                )}
                {attributeCount < 3 && (
                  <button
                    type="button"
                    onClick={() => setAttributeCount((prev) => Math.min(3, prev + 1) as 1 | 2 | 3)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-300 dark:hover:bg-blue-700 transition text-lg font-bold"
                    title="Tambah tipe"
                  >
                    +
                  </button>
                )}
              </div>
            </div>

            <div className={`grid gap-3 ${attributeCount === 1 ? 'grid-cols-1' : attributeCount === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
              <div>
                <label className="block text-xs font-medium text-blue-900 dark:text-blue-300 mb-1.5">
                  Tipe 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={variantTypes.type1}
                  onChange={(e) => {
                    const newType1 = e.target.value;
                    setVariantTypes({ ...variantTypes, type1: newType1 });
                    const typesArray = [newType1];
                    if (attributeCount >= 2) typesArray.push(variantTypes.type2);
                    if (attributeCount >= 3) typesArray.push(variantTypes.type3);
                    const newTypes = typesArray.filter(t => t).join(' | ');
                    setVariants(variants.map(v => ({ ...v, variantName: newTypes || 'Default' })));
                  }}
                  className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Contoh: Warna"
                />
              </div>
              {attributeCount >= 2 && (
                <div>
                  <label className="block text-xs font-medium text-blue-900 dark:text-blue-300 mb-1.5">
                    Tipe 2
                  </label>
                  <input
                    type="text"
                    value={variantTypes.type2}
                    onChange={(e) => {
                      const newType2 = e.target.value;
                      setVariantTypes({ ...variantTypes, type2: newType2 });
                      const typesArray = [variantTypes.type1, newType2];
                      if (attributeCount >= 3) typesArray.push(variantTypes.type3);
                      const newTypes = typesArray.filter(t => t).join(' | ');
                      setVariants(variants.map(v => ({ ...v, variantName: newTypes || 'Default' })));
                    }}
                    className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Contoh: Ukuran"
                  />
                </div>
              )}
              {attributeCount >= 3 && (
                <div>
                  <label className="block text-xs font-medium text-blue-900 dark:text-blue-300 mb-1.5">
                    Tipe 3
                  </label>
                  <input
                    type="text"
                    value={variantTypes.type3}
                    onChange={(e) => {
                      const newType3 = e.target.value;
                      setVariantTypes({ ...variantTypes, type3: newType3 });
                      const typesArray = [variantTypes.type1, variantTypes.type2, newType3];
                      const newTypes = typesArray.filter(t => t).join(' | ');
                      setVariants(variants.map(v => ({ ...v, variantName: newTypes || 'Default' })));
                    }}
                    className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Contoh: Model"
                  />
                </div>
              )}
            </div>
            
            {attributeCount < 3 && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Klik + untuk menambah tipe varian (maks. 3)
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Varian Produk</h2>
            {variantTypes.type1 && (
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-4 py-2 bg-slate-600 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Varian
              </button>
            )}
          </div>

          {/* Bulk Apply Form - Always visible */}
          <div className="mb-6 p-4 bg-slate-50 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-600">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Terapkan ke Semua Varian</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  SKU Prefix
                </label>
                <input
                  type="text"
                  value={bulkApply.sku}
                  onChange={(e) => setBulkApply({...bulkApply, sku: e.target.value})}
                  className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., PRD-"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Stok (ke semua cabang)
                </label>
                <input
                  type="number"
                  value={bulkApply.stock}
                  onChange={(e) => setBulkApply({...bulkApply, stock: e.target.value})}
                  className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Harga (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={bulkApply.price ? Number(bulkApply.price).toLocaleString('id-ID') : ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setBulkApply({...bulkApply, price: val});
                  }}
                  className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="50.000"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={applyBulkValues}
                  className="w-full px-4 py-1.5 bg-slate-600 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 text-sm font-medium"
                >
                  Terapkan
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              SKU akan menambahkan nomor urut (e.g., PRD-1, PRD-2). Kosongkan field yang tidak ingin diubah.
            </p>
          </div>

          

          {variants.map((variant, variantIndex) => (
            <div key={variantIndex} className="mb-4 p-4 md:p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-7 h-7 bg-slate-600 dark:bg-slate-700 text-white rounded-md font-semibold text-sm">
                    {variantIndex + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {variant.variantValue 
                        ? variant.variantValue 
                        : `Varian #${variantIndex + 1}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{variant.sku || 'SKU belum diisi'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(variantIndex)}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 dark:hover:bg-red-700 border border-red-600 dark:border-red-500 rounded-md transition-colors"
                >
                  Hapus
                </button>
              </div>

              {/* Variant Details */}
              <div className="space-y-3">
                {/* Value Inputs */}
                <div className={`grid grid-cols-1 gap-3 ${attributeCount === 1 ? 'md:grid-cols-1' : attributeCount === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                  {variantTypes.type1 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {variantTypes.type1} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={variant.variantValue.split(' | ')[0] || ''}
                        onChange={(e) => {
                          const values = variant.variantValue.split(' | ');
                          values[0] = e.target.value;
                          const newValues = values.slice(0, attributeCount).filter((v: string) => v);
                          handleVariantChange(variantIndex, 'variantValue', newValues.join(' | '));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={`Contoh: ${variantTypes.type1 === 'Warna' ? 'Merah' : variantTypes.type1 === 'Ukuran' ? '25' : 'Value'}`}
                      />
                    </div>
                  )}

                  {attributeCount >= 2 && variantTypes.type2 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {variantTypes.type2}
                      </label>
                      <input
                        type="text"
                        value={variant.variantValue.split(' | ')[1] || ''}
                        onChange={(e) => {
                          const values = variant.variantValue.split(' | ');
                          while (values.length < 2) values.push('');
                          values[1] = e.target.value;
                          const newValues = values.slice(0, attributeCount).filter((v: string) => v);
                          handleVariantChange(variantIndex, 'variantValue', newValues.join(' | '));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={`Contoh: ${variantTypes.type2 === 'Ukuran' ? '25' : variantTypes.type2 === 'Model' ? '2024' : 'Value'}`}
                      />
                    </div>
                  )}

                  {attributeCount >= 3 && variantTypes.type3 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {variantTypes.type3}
                      </label>
                      <input
                        type="text"
                        value={variant.variantValue.split(' | ')[2] || ''}
                        onChange={(e) => {
                          const values = variant.variantValue.split(' | ');
                          while (values.length < 3) values.push('');
                          values[2] = e.target.value;
                          const newValues = values.slice(0, attributeCount).filter((v: string) => v);
                          handleVariantChange(variantIndex, 'variantValue', newValues.join(' | '));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={`Contoh: ${variantTypes.type3 === 'Model' ? '2024' : 'Value'}`}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => handleVariantChange(variantIndex, 'sku', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono focus:ring-1 focus:ring-slate-500 focus:border-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="VAR-009"
                  />
                </div>

                {/* Marketplace Info - Collapsible */}
                <details className="group border border-gray-200 dark:border-gray-600 rounded-md">
                  <summary className="px-3 py-2 bg-gray-50 dark:bg-gray-700 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 rounded-md">
                    <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Info Marketplace (Opsional)
                  </summary>
                  <div className="p-3 space-y-3 bg-white dark:bg-gray-800">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        URL Gambar
                      </label>
                      <input
                        type="url"
                        value={variant.imageUrl || ''}
                        onChange={(e) => handleVariantChange(variantIndex, 'imageUrl', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Berat (gram)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variant.weight || ''}
                          onChange={(e) => handleVariantChange(variantIndex, 'weight', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Panjang (cm)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variant.length || ''}
                          onChange={(e) => handleVariantChange(variantIndex, 'length', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Lebar (cm)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variant.width || ''}
                          onChange={(e) => handleVariantChange(variantIndex, 'width', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="5"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Tinggi (cm)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variant.height || ''}
                          onChange={(e) => handleVariantChange(variantIndex, 'height', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="3"
                        />
                      </div>
                    </div>
                  </div>
                </details>

                {/* Harga & Stock per Cabang Section */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Harga & Stok per Cabang
                  </label>
                  <div className="space-y-2">
                    {variant.stocks.map((stock: any, stockIndex: number) => (
                      <div key={stockIndex} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-2.5 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            {stock.cabangName}
                          </span>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Harga</label>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-xs">
                              Rp
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={stock.price ? Number(stock.price).toLocaleString('id-ID') : ''}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '');
                                handleStockChange(variantIndex, stockIndex, 'price', val);
                              }}
                              onBlur={(e) => {
                                const num = parseFloat(e.target.value.replace(/\./g, '')) || 0;
                                handleStockChange(variantIndex, stockIndex, 'price', String(num));
                              }}
                              className="w-full pl-8 pr-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              placeholder="50.000"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Stok</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={stock.quantity || ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '').replace(/^0+/, '') || '0';
                              handleStockChange(variantIndex, stockIndex, 'quantity', val);
                            }}
                            onBlur={(e) => {
                              const num = parseInt(e.target.value) || 0;
                              handleStockChange(variantIndex, stockIndex, 'quantity', String(num));
                            }}
                            className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-center font-semibold focus:ring-1 focus:ring-slate-500 focus:border-slate-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {variants.length === 0 && variantTypes.type1 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Belum ada varian. Klik tombol "Tambah Varian" untuk menambahkan.
            </p>
          )}
          {variants.length === 0 && !variantTypes.type1 && (
            <p className="text-center text-orange-600 dark:text-orange-400 py-8">
              Isi Type 1 terlebih dahulu untuk menambahkan varian.
            </p>
          )}
        </div>
        </>
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
