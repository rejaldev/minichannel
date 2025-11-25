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
  existingVariants?: Array<{ variantName: string; variantValue: string; sku: string; price: number; stock: number }>;
}

export default function DynamicVariantBuilder({ onGenerate, existingVariants = [] }: DynamicVariantBuilderProps) {
  // Load existing variants on mount if available
  const loadExistingVariants = () => {
    if (existingVariants.length === 0) {
      return [{ name: 'Ukuran', options: [''] }];
    }

    // Extract unique variant names
    const variantName = existingVariants[0]?.variantName || 'Ukuran';
    const options = existingVariants.map(v => {
      // Extract just the value (before parentheses if exists)
      const match = v.variantValue.match(/^([^(]+)/);
      return match ? match[1].trim() : v.variantValue;
    }).filter((v, i, arr) => arr.indexOf(v) === i); // unique values

    return [{ name: variantName, options: options.length > 0 ? options : [''] }];
  };

  const [variantTypes, setVariantTypes] = useState<VariantType[]>(loadExistingVariants);
  const [basePrice, setBasePrice] = useState(existingVariants[0]?.price?.toString() || '');
  const [baseStock, setBaseStock] = useState(existingVariants[0]?.stock?.toString() || '');

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
        sku: `VAR-${String(index + 1).padStart(3, '0')}`,
        price: basePrice || '',
        stock: baseStock || ''
      };
    });

    onGenerate(generatedVariants);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Generator Varian
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Tentukan nama varian dan opsi-opsinya
          </p>
        </div>
      </div>

      {/* Variant Types */}
      <div className="space-y-3">
        {variantTypes.map((type, typeIndex) => (
          <div key={typeIndex} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">Nama Varian:</label>
              <input
                type="text"
                value={type.name}
                onChange={(e) => updateVariantTypeName(typeIndex, e.target.value)}
                placeholder="Nama Tipe Varian (Ukuran, Warna, Material...)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm font-semibold bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
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
                      placeholder={type.name === 'Ukuran' ? `${6 + optionIndex * 2}` : `Opsi ${optionIndex + 1}`}
                      className="flex-1 px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium flex items-center gap-1"
              >
                <span className="text-sm">+</span> Tambah Opsi
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Base Price & Stock */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
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
        className="w-full py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all text-sm font-bold shadow-sm flex items-center justify-center gap-2"
      >
        Generate Varian
      </button>
    </div>
  );
}
