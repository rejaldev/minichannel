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
  
  getStockAdjustments: (variantId: string, cabangId: string, params?: { limit?: number }) =>
    api.get(`/products/stock/${variantId}/${cabangId}/adjustments`, { params }),
  
  getAllAdjustments: (params?: { cabangId?: string; startDate?: string; endDate?: string; reason?: string; limit?: number }) =>
    api.get('/products/adjustments/all', { params }),
  
  getLowStockAlerts: () => api.get('/products/alerts/low-stock'),
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
