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
            minStock: existingStock?.minStock || 5,
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
          minStock: 5,
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
          minStock: 5,
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
            <div key={variantIndex} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Varian #{variantIndex + 1}</h3>
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(variantIndex)}
                  className="text-slate-600 hover:text-slate-800 text-sm font-medium"
                >
                  Hapus
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Varian (e.g., Size)
                  </label>
                  <input
                    type="text"
                    value={variant.variantName}
                    onChange={(e) => handleVariantChange(variantIndex, 'variantName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="e.g., Size, Number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value (e.g., M)
                  </label>
                  <input
                    type="text"
                    value={variant.variantValue}
                    onChange={(e) => handleVariantChange(variantIndex, 'variantValue', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="e.g., M, 10, XL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => handleVariantChange(variantIndex, 'sku', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    placeholder="e.g., SRG-M"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga *
                  </label>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="50000"
                    min="0"
                    step="any"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stok per Cabang
                </label>
                <div className="space-y-2">
                  {variant.stocks.map((stock: any, stockIndex: number) => (
                    <div key={stockIndex} className="grid grid-cols-2 gap-3 items-center">
                      <div className="text-sm text-gray-700 font-medium">
                        {stock.cabangName}
                      </div>
                      <div>
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
                          className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                          placeholder="Qty"
                          min="0"
                        />
                      </div>
                    </div>
                  ))}
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
