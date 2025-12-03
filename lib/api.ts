import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://anekabuana-api.ziqrishahab.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 errors (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Export both default and named export for flexibility
export { api };
export default api;

// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  me: () => api.get('/auth/me'),
  
  createUser: (data: { email: string; password: string; name: string; role: string; cabangId: string }) =>
    api.post('/auth/users', data),
  
  updateUser: (id: string, data: { name: string; role: string; cabangId: string; password?: string; isActive?: boolean }) =>
    api.put(`/auth/users/${id}`, data),
  
  getUsers: () => api.get('/auth/users'),
};

// Products API
export const productsAPI = {
  getProducts: (params?: { categoryId?: string; search?: string; isActive?: boolean }) =>
    api.get('/products', { params }),
  
  getProduct: (id: string) => api.get(`/products/${id}`),
  
  createProduct: (data: any) => api.post('/products', data),
  
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data),
  
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  
  getCategories: () => api.get('/products/categories'),
  
  createCategory: (data: { name: string; description?: string }) =>
    api.post('/products/categories', data),
  
  getStock: (variantId: string) => api.get(`/products/stock/${variantId}`),
  
  updateStock: (variantId: string, cabangId: string, data: { quantity: number; price?: number; reason?: string; notes?: string }) =>
    api.put(`/products/stock/${variantId}/${cabangId}`, data),
  
  getLowStockAlerts: () => api.get('/products/alerts/low-stock'),
  
  searchBySKU: (sku: string) => api.get(`/products/search/sku/${sku}`),
  
  // Import/Export (CSV only - single file with 2 sections)
  downloadTemplate: () => 
    api.get('/products/template', { responseType: 'blob' }),
  
  importProducts: (formData: FormData) => {
    const importApi = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Add token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        importApi.defaults.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return importApi.post('/products/import', formData);
  },
  
  exportProducts: () => 
    api.get('/products/export', { responseType: 'blob' }),
};

// Transactions API
export const transactionsAPI = {
  createTransaction: (data: {
    cabangId: string;
    customerName?: string;
    customerPhone?: string;
    items: Array<{ productVariantId: string; quantity: number; price: number }>;
    discount?: number;
    tax?: number;
    paymentMethod: string;
    // Payment Details
    bankName?: string;
    referenceNo?: string;
    cardLastDigits?: string;
    notes?: string;
  }) => api.post('/transactions', data),
  
  getTransactions: (params?: {
    cabangId?: string;
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
  }) => api.get('/transactions', { params }),
  
  getTransaction: (id: string) => api.get(`/transactions/${id}`),
  
  getSummary: (params?: {
    cabangId?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/transactions/reports/summary', { params }),
  
  getSalesTrend: (params?: {
    cabangId?: string;
    days?: number;
  }) => api.get('/transactions/reports/sales-trend', { params }),
  
  getTopProducts: (params?: {
    cabangId?: string;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => api.get('/transactions/reports/top-products', { params }),
  
  getBranchPerformance: (params?: {
    startDate?: string;
    endDate?: string;
  }) => api.get('/transactions/reports/branch-performance', { params }),
  
  getTimeStats: (params?: {
    cabangId?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/transactions/reports/time-stats', { params }),
  
  cancelTransaction: (id: string, reason: string) =>
    api.put(`/transactions/${id}/cancel`, { reason }),
};

// Categories API
export const categoriesAPI = {
  getCategories: () => api.get('/products/categories'),
  
  createCategory: (data: { name: string; description?: string }) =>
    api.post('/products/categories', data),
};

// Cabang API
export const cabangAPI = {
  getCabangs: () => api.get('/cabang'),
  
  getCabang: (id: string) => api.get(`/cabang/${id}`),
  
  createCabang: (data: { name: string; address: string; phone?: string }) =>
    api.post('/cabang', data),
  
  updateCabang: (id: string, data: { name?: string; address?: string; phone?: string; isActive?: boolean }) =>
    api.put(`/cabang/${id}`, data),
};

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  
  getSetting: (key: string) => api.get(`/settings/${key}`),
  
  updateSettings: (data: { [key: string]: string | number }) =>
    api.put('/settings', data),
};

// Returns API
export const returnsAPI = {
  getReturns: (params?: {
    status?: string;
    cabangId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/returns', { params }),
  
  getReturn: (id: string) => api.get(`/returns/${id}`),
  
  getStats: (params?: { cabangId?: string }) =>
    api.get('/returns/stats', { params }),
  
  createReturn: (data: {
    transactionId: string;
    cabangId: string;
    reason: string;
    notes?: string;
    items: Array<{
      productVariantId: string;
      quantity: number;
      price: number;
    }>;
    refundMethod?: string;
  }) => api.post('/returns', data),
  
  approveReturn: (id: string, data: { approvedBy: string; notes?: string }) =>
    api.patch(`/returns/${id}/approve`, data),
  
  rejectReturn: (id: string, data: { rejectedBy: string; rejectionNotes: string }) =>
    api.patch(`/returns/${id}/reject`, data),
  
  deleteReturn: (id: string) => api.delete(`/returns/${id}`),
};

// Orders API
export const ordersAPI = {
  getOrders: (params?: {
    status?: string;
    cabangId?: string;
  }) => api.get('/orders', { params }),
  
  getOrder: (id: string) => api.get(`/orders/${id}`),
  
  createOrder: (data: {
    productName: string;
    productType?: string;
    categoryId?: string;
    categoryName?: string;
    price?: number;
    quantity?: number;
    notes?: string;
  }) => api.post('/orders', data),
  
  approveOrder: (id: string, data: { productId?: string; variantId?: string }) =>
    api.put(`/orders/${id}/approve`, data),
  
  rejectOrder: (id: string, data: { rejectionReason: string }) =>
    api.put(`/orders/${id}/reject`, data),
  
  deleteOrder: (id: string) => api.delete(`/orders/${id}`),
  
  getStats: () => api.get('/orders/stats/summary'),
};

// Stock Transfers API
export const stockTransfersAPI = {
  getTransfers: (params?: {
    cabangId?: string;
    variantId?: string;
    status?: string;
  }) => api.get('/stock-transfers', { params }),
  
  getTransfer: (id: string) => api.get(`/stock-transfers/${id}`),
  
  createTransfer: (data: {
    variantId: string;
    fromCabangId: string;
    toCabangId: string;
    quantity: number;
    notes?: string;
  }) => api.post('/stock-transfers', data),
  
  getStats: (params?: { cabangId?: string }) =>
    api.get('/stock-transfers/stats/summary', { params }),
};
