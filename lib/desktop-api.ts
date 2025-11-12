/**
 * Desktop API Wrapper
 * Uses SQLite for offline-first operations with auto-sync
 */

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI;

/**
 * Products API - SQLite backed
 */
export const productsAPI = {
  async getProducts(filters = {}) {
    if (isElectron) {
      const result = await window.electronAPI.getProducts(filters);
      if (result.success) {
        return { data: result.data };
      }
      throw new Error(result.error);
    }
    // Fallback to HTTP API if not in Electron
    const response = await fetch('/api/products?' + new URLSearchParams(filters));
    return response.json();
  },

  async getCategories() {
    if (isElectron) {
      const result = await window.electronAPI.getCategories();
      if (result.success) {
        return { data: result.data };
      }
      throw new Error(result.error);
    }
    const response = await fetch('/api/products/categories');
    return response.json();
  }
};

/**
 * Transactions API - SQLite backed with auto-sync
 */
export const transactionsAPI = {
  async createTransaction(data: any) {
    if (isElectron) {
      const result = await window.electronAPI.createTransaction(data);
      if (result.success) {
        return { 
          data: { 
            transaction: { 
              id: result.transactionId,
              ...data 
            }
          },
          syncResult: result.syncResult
        };
      }
      throw new Error(result.error);
    }
    // Fallback to HTTP API
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getQueueStats() {
    if (isElectron) {
      return await window.electronAPI.getQueueStats();
    }
    return { total: 0, pending: 0, failed: 0, warningLevel: 'none' };
  },

  async getQueuedTransactions() {
    if (isElectron) {
      const result = await window.electronAPI.getQueuedTransactions();
      if (result.success) {
        return { data: result.data };
      }
      throw new Error(result.error);
    }
    return { data: [] };
  }
};

/**
 * Sync API - Manual sync triggers
 */
export const syncAPI = {
  async syncProductsNow() {
    if (isElectron) {
      return await window.electronAPI.syncProductsNow();
    }
    throw new Error('Sync only available in desktop app');
  },

  async syncTransactionsNow() {
    if (isElectron) {
      return await window.electronAPI.syncTransactionsNow();
    }
    throw new Error('Sync only available in desktop app');
  },

  async retryFailedNow() {
    if (isElectron) {
      return await window.electronAPI.retryFailedNow();
    }
    throw new Error('Sync only available in desktop app');
  },

  async getNetworkStatus() {
    if (isElectron) {
      return await window.electronAPI.getNetworkStatus();
    }
    return { status: 'online', isOnline: true, isOffline: false };
  },

  async getQueueStats() {
    if (isElectron) {
      return await window.electronAPI.getQueueStats();
    }
    return { total: 0, pending: 0, failed: 0, warningLevel: 'none' };
  },

  onNetworkStatusChange(callback: (data: any) => void) {
    if (isElectron) {
      window.electronAPI.onNetworkStatusChange(callback);
    }
  },

  onProductSyncUpdate(callback: (data: any) => void) {
    if (isElectron) {
      window.electronAPI.onProductSyncUpdate(callback);
    }
  },

  onTransactionSyncUpdate(callback: (data: any) => void) {
    if (isElectron) {
      window.electronAPI.onTransactionSyncUpdate(callback);
    }
  },

  onQueueUpdate(callback: (data: any) => void) {
    if (isElectron) {
      window.electronAPI.onQueueUpdate(callback);
    }
  }
};

/**
 * Auth API - With Electron token management
 */
export const authAPI = {
  async setAuthToken(token: string) {
    if (isElectron) {
      await window.electronAPI.setAuthToken(token);
    }
    // Also store in localStorage for web compatibility
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },

  async clearAuthToken() {
    if (isElectron) {
      await window.electronAPI.clearAuthToken();
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};

export const isElectronApp = isElectron;
