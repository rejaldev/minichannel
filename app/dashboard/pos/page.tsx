'use client';

import { useEffect, useState } from 'react';
import { productsAPI, transactionsAPI } from '@/lib/api';
import { getAuth } from '@/lib/auth';

interface CartItem {
  productVariantId: string;
  productName: string;
  variantInfo: string;
  sku: string;
  price: number;
  quantity: number;
  availableStock: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'DEBIT' | 'TRANSFER' | 'QRIS'>('CASH');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'NOMINAL' | 'PERCENTAGE'>('NOMINAL');
  // Payment Details
  const [bankName, setBankName] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [cardLastDigits, setCardLastDigits] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  // Toggle states
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const { user } = getAuth();

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      const res = await productsAPI.getProducts({
        search: search || undefined,
        isActive: true,
      });
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any, variant: any) => {
    const stock = variant.stocks?.find((s: any) => s.cabangId === user?.cabangId);
    if (!stock || stock.quantity <= 0) {
      alert('Stok tidak tersedia!');
      return;
    }

    const existingItem = cart.find((item) => item.productVariantId === variant.id);
    
    if (existingItem) {
      if (existingItem.quantity >= stock.quantity) {
        alert('Stok tidak mencukupi!');
        return;
      }
      setCart(
        cart.map((item) =>
          item.productVariantId === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productVariantId: variant.id,
          productName: product.name,
          variantInfo: `${variant.variantName}: ${variant.variantValue}`,
          sku: variant.sku,
          price: variant.price,
          quantity: 1,
          availableStock: stock.quantity,
        },
      ]);
    }
  };

  const updateQuantity = (variantId: string, newQuantity: number) => {
    const item = cart.find((i) => i.productVariantId === variantId);
    if (!item) return;

    if (newQuantity <= 0) {
      removeFromCart(variantId);
      return;
    }

    if (newQuantity > item.availableStock) {
      alert('Stok tidak mencukupi!');
      return;
    }

    setCart(
      cart.map((item) =>
        item.productVariantId === variantId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (variantId: string) => {
    setCart(cart.filter((item) => item.productVariantId !== variantId));
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Calculate discount based on type
    let discountAmount = 0;
    if (discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * discount) / 100;
    } else {
      discountAmount = discount;
    }
    
    const total = subtotal - discountAmount;
    return { subtotal, total, discountAmount };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }

    // Validation for payment details
    if (paymentMethod === 'DEBIT' || paymentMethod === 'TRANSFER') {
      if (!bankName) {
        alert('Pilih bank terlebih dahulu!');
        return;
      }
    }

    setProcessing(true);
    try {
      const { subtotal, total, discountAmount } = calculateTotal();
      
      const response = await transactionsAPI.createTransaction({
        cabangId: user!.cabangId,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        items: cart.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          price: item.price,
        })),
        discount: discountAmount, // Send actual discount amount
        tax: 0,
        paymentMethod,
        // Payment Details
        bankName: bankName || undefined,
        referenceNo: referenceNo || undefined,
        cardLastDigits: cardLastDigits || undefined,
      });

      setLastTransaction(response.data.transaction);
      setShowSuccess(true);
      
      // Reset form
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscount(0);
      setDiscountType('NOMINAL');
      setPaymentMethod('CASH');
      setBankName('');
      setReferenceNo('');
      setCardLastDigits('');
      
      // Refresh products to update stock
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Transaksi gagal!');
    } finally {
      setProcessing(false);
    }
  };

  const { subtotal, total } = calculateTotal();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Point of Sale
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="relative mb-6">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk..."
                className="w-full px-5 py-4 pl-12 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-lg"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="border-2 border-gray-100 dark:border-gray-700 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{product.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{product.category?.name}</p>
                    </div>
                    <div className="text-right">
                      {(() => {
                        if (product.productType === 'SINGLE') {
                          return (
                            <p className="text-xl font-bold text-slate-600 dark:text-slate-400">
                              Rp {product.price?.toLocaleString('id-ID')}
                            </p>
                          );
                        } else {
                          const prices = product.variants?.map((v: any) => v.price) || [];
                          const minPrice = Math.min(...prices);
                          const maxPrice = Math.max(...prices);
                          return (
                            <p className="text-xl font-bold text-slate-600 dark:text-slate-400">
                              {minPrice === maxPrice 
                                ? `Rp ${minPrice.toLocaleString('id-ID')}`
                                : `Rp ${minPrice.toLocaleString('id-ID')} - ${maxPrice.toLocaleString('id-ID')}`
                              }
                            </p>
                          );
                        }
                      })()}
                    </div>
                  </div>

                  {/* Variants or Single Product Button */}
                  {product.productType === 'SINGLE' ? (
                    <button
                      onClick={() => {
                        const defaultVariant = product.variants?.[0];
                        if (defaultVariant) addToCart(product, defaultVariant);
                      }}
                      className="w-full p-4 rounded-xl border-2 bg-gradient-to-br from-white to-blue-50 dark:from-gray-700 dark:to-blue-900/20 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transform hover:scale-[1.01] font-semibold text-blue-700 dark:text-blue-300 transition-all"
                    >
                      + Tambah ke Keranjang
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {product.variants?.map((variant: any) => {
                        const stock = variant.stocks?.find(
                          (s: any) => s.cabangId === user?.cabangId
                        );
                        const isOutOfStock = !stock || stock.quantity <= 0;

                        return (
                          <button
                            key={variant.id}
                            onClick={() => addToCart(product, variant)}
                            disabled={isOutOfStock}
                            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                              isOutOfStock
                                ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-br from-white to-blue-50 dark:from-gray-700 dark:to-blue-900/20 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transform hover:scale-[1.01]'
                            }`}
                          >
                            <div className="font-bold text-gray-900 dark:text-white">
                              {variant.variantName}: {variant.variantValue}
                            </div>
                            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                              Rp {variant.price.toLocaleString('id-ID')}
                            </div>
                            <div className={`text-xs mt-1 ${isOutOfStock ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>
                              {isOutOfStock ? 'Habis' : `${stock.quantity} pcs`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart & Checkout */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-slate-900/20 rounded-2xl shadow-xl border-2 border-slate-100 dark:border-slate-800 p-6 sticky top-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <span className="mr-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </span> 
              Keranjang
            </h2>

            {/* Cart Items */}
            <div className="space-y-3 mb-6 max-h-[250px] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-gray-400 dark:text-gray-500 font-medium">Keranjang masih kosong</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productVariantId}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.variantInfo}</p>
                      <p className="text-base font-bold text-blue-600 mt-1">
                        Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.productVariantId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 font-bold"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-lg">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productVariantId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-blue-100 border border-blue-200 rounded-lg hover:bg-blue-200 font-bold"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productVariantId)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-bold text-lg"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer Info - Collapsible */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
              <button
                type="button"
                onClick={() => setShowCustomerInfo(!showCustomerInfo)}
                className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 hover:text-gray-900 dark:hover:text-white transition"
              >
                <span>Info Pelanggan (opsional)</span>
                <svg 
                  className={`w-5 h-5 transition-transform ${showCustomerInfo ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showCustomerInfo && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nama Pelanggan"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="No. Telp"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Discount - Collapsible */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowDiscount(!showDiscount)}
                className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 hover:text-gray-900 dark:hover:text-white transition"
              >
                <span>Diskon (opsional)</span>
                <svg 
                  className={`w-5 h-5 transition-transform ${showDiscount ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showDiscount && (
                <>
                  {/* Discount Type Toggle */}
                  <div className="flex space-x-2 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType('NOMINAL');
                        setDiscount(0);
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                        discountType === 'NOMINAL'
                          ? 'bg-slate-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Nominal (Rp)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType('PERCENTAGE');
                        setDiscount(0);
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                        discountType === 'PERCENTAGE'
                          ? 'bg-slate-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Persentase (%)
                    </button>
                  </div>

                  {/* Discount Input */}
                  <div className="relative">
                    <input
                      type="number"
                      value={discount || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/^0+(?=\d)/, ''); // Remove leading zeros except single 0
                        const value = parseFloat(val) || 0;
                        if (discountType === 'PERCENTAGE') {
                          setDiscount(Math.min(100, Math.max(0, value))); // Max 100%
                        } else {
                          setDiscount(Math.max(0, value));
                        }
                      }}
                      onBlur={(e) => {
                        const num = parseFloat(e.target.value) || 0;
                        if (discountType === 'PERCENTAGE') {
                          setDiscount(Math.min(100, Math.max(0, num)));
                        } else {
                          setDiscount(Math.max(0, num));
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={discountType === 'PERCENTAGE' ? '0 - 100' : '0'}
                      step={discountType === 'PERCENTAGE' ? '0.1' : '1000'}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        {discountType === 'PERCENTAGE' ? '%' : 'Rp'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['CASH', 'DEBIT', 'TRANSFER', 'QRIS'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      setPaymentMethod(method);
                      // Reset payment details when changing method
                      setBankName('');
                      setReferenceNo('');
                      setCardLastDigits('');
                    }}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                      paymentMethod === method
                        ? 'bg-slate-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Details - Conditional Fields */}
            {(paymentMethod === 'DEBIT' || paymentMethod === 'TRANSFER') && (
              <div className="mb-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bank
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Pilih Bank</option>
                    <option value="BCA">BCA</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BRI">BRI</option>
                    <option value="BNI">BNI</option>
                    <option value="CIMB Niaga">CIMB Niaga</option>
                    <option value="Permata">Permata</option>
                    <option value="Danamon">Danamon</option>
                    <option value="BTN">BTN</option>
                    <option value="OCBC NISP">OCBC NISP</option>
                    <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                    <option value="DKI">Bank DKI</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                
                {paymentMethod === 'DEBIT' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        4 Digit Terakhir Kartu
                      </label>
                      <input
                        type="text"
                        value={cardLastDigits}
                        onChange={(e) => setCardLastDigits(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="1234"
                        maxLength={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nomor Approval/EDC
                      </label>
                      <input
                        type="text"
                        value={referenceNo}
                        onChange={(e) => setReferenceNo(e.target.value)}
                        placeholder="Nomor approval dari mesin EDC"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </>
                )}

                {paymentMethod === 'TRANSFER' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nomor Referensi
                      </label>
                      <input
                        type="text"
                        value={referenceNo}
                        onChange={(e) => setReferenceNo(e.target.value)}
                        placeholder="Nomor referensi transfer"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {paymentMethod === 'QRIS' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nomor Referensi/Transaction ID
                </label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="Transaction ID dari QRIS"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {/* Total */}
            <div className="border-t border-gray-200 pt-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Diskon {discountType === 'PERCENTAGE' ? `(${discount}%)` : ''}:
                  </span>
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    -Rp {calculateTotal().discountAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-slate-600">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || processing}
              className="w-full py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {processing ? 'Memproses...' : 'Bayar'}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && lastTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Transaksi Berhasil!
              </h3>
              <p className="text-gray-600">
                No. Invoice: <span className="font-mono font-semibold">{lastTransaction.transactionNo}</span>
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-lg">
                  Rp {lastTransaction.total.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pembayaran:</span>
                <span className="font-medium">{lastTransaction.paymentMethod}</span>
              </div>
            </div>

            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition"
            >
              Transaksi Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
