'use client';

import { useState } from 'react';

interface VariantType {
  name: string;
  options: string[];
}

interface GeneratedVariant {
  variantName: string;
  variantValue: string;
  sku: string;
  price: string;
  stock: string;
}

interface DynamicVariantBuilderProps {
  onGenerate: (variants: GeneratedVariant[]) => void;
}

export default function DynamicVariantBuilder({ onGenerate }: DynamicVariantBuilderProps) {
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([
    { name: '', options: [''] }
  ]);
  const [basePrice, setBasePrice] = useState('');
  const [baseStock, setBaseStock] = useState('');
  const [skuPrefix, setSkuPrefix] = useState('VAR');

  const addVariantType = () => {
    setVariantTypes([...variantTypes, { name: '', options: [''] }]);
  };

  const removeVariantType = (index: number) => {
    setVariantTypes(variantTypes.filter((_, i) => i !== index));
  };

  const updateVariantTypeName = (index: number, name: string) => {
    const updated = [...variantTypes];
    updated[index].name = name;
    setVariantTypes(updated);
  };

  const addOption = (typeIndex: number) => {
    const updated = [...variantTypes];
    updated[typeIndex].options.push('');
    setVariantTypes(updated);
  };

  const removeOption = (typeIndex: number, optionIndex: number) => {
    const updated = [...variantTypes];
    updated[typeIndex].options = updated[typeIndex].options.filter((_, i) => i !== optionIndex);
    setVariantTypes(updated);
  };

  const updateOption = (typeIndex: number, optionIndex: number, value: string) => {
    const updated = [...variantTypes];
    updated[typeIndex].options[optionIndex] = value;
    setVariantTypes(updated);
  };

  const generateCartesianProduct = (arrays: string[][]): string[][] => {
    if (arrays.length === 0) return [[]];
    const [first, ...rest] = arrays;
    const restProduct = generateCartesianProduct(rest);
    return first.flatMap(item => restProduct.map(combo => [item, ...combo]));
  };

  const generateVariants = () => {
    // Filter out empty variant types and options
    const validTypes = variantTypes.filter(
      type => type.name.trim() && type.options.some(opt => opt.trim())
    );

    if (validTypes.length === 0) {
      alert('Tambahkan minimal 1 tipe varian dengan opsi!');
      return;
    }

    const validOptions = validTypes.map(type => 
      type.options.filter(opt => opt.trim())
    );

    // Generate all combinations using Cartesian product
    const combinations = generateCartesianProduct(validOptions);

    const generatedVariants: GeneratedVariant[] = combinations.map((combo, index) => {
      // Create variant name and value
      const variantParts = validTypes.map((type, i) => ({
        name: type.name,
        value: combo[i]
      }));

      // Use first type as primary variant name, rest as secondary
      const primaryVariant = variantParts[0];
      const secondaryValues = variantParts.slice(1).map(p => p.value).join('-');
      
      return {
        variantName: primaryVariant.name,
        variantValue: secondaryValues 
          ? `${primaryVariant.value} (${secondaryValues})`
          : primaryVariant.value,
        sku: `${skuPrefix}-${String(index + 1).padStart(3, '0')}`,
        price: basePrice || '',
        stock: baseStock || ''
      };
    });

    onGenerate(generatedVariants);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generator Varian Otomatis
          </h3>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            Buat tipe varian (Ukuran, Warna, dll) dan sistem akan generate semua kombinasi otomatis
          </p>
        </div>
      </div>

      {/* Variant Types */}
      <div className="space-y-3">
        {variantTypes.map((type, typeIndex) => (
          <div key={typeIndex} className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={type.name}
                onChange={(e) => updateVariantTypeName(typeIndex, e.target.value)}
                placeholder="Nama Tipe (Ukuran, Warna, Material...)"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {variantTypes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariantType(typeIndex)}
                  className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition text-sm font-medium"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Opsi:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {type.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(typeIndex, optionIndex, e.target.value)}
                      placeholder={`Opsi ${optionIndex + 1}`}
                      className="flex-1 px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {type.options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(typeIndex, optionIndex)}
                        className="w-7 h-7 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addOption(typeIndex)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <span className="text-sm">+</span> Tambah Opsi
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addVariantType}
        className="w-full py-2 border-2 border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-sm font-medium"
      >
        + Tambah Tipe Varian
      </button>

      {/* SKU Prefix, Base Price & Stock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-blue-200 dark:border-blue-800">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Prefix SKU</label>
          <input
            type="text"
            value={skuPrefix}
            onChange={(e) => setSkuPrefix(e.target.value.toUpperCase())}
            placeholder="VAR"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white uppercase"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">SKU: {skuPrefix}-001, {skuPrefix}-002, ...</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Harga Default (opsional)</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-xs">Rp</span>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="50000"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Stok Default (opsional)</label>
          <input
            type="number"
            value={baseStock}
            onChange={(e) => setBaseStock(e.target.value)}
            placeholder="10"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={generateVariants}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Generate Semua Kombinasi Varian
      </button>
    </div>
  );
}
