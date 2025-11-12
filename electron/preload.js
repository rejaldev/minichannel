const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Auth
  setAuthToken: (token) => ipcRenderer.invoke('set-auth-token', token),
  clearAuthToken: () => ipcRenderer.invoke('clear-auth-token'),

  // Network
  getNetworkStatus: () => ipcRenderer.invoke('get-network-status'),
  onNetworkStatusChange: (callback) => {
    ipcRenderer.on('network-status-change', (event, data) => callback(data));
  },

  // Products
  getProducts: (filters) => ipcRenderer.invoke('get-products', filters),
  getCategories: () => ipcRenderer.invoke('get-categories'),
  onProductSyncUpdate: (callback) => {
    ipcRenderer.on('product-sync-update', (event, data) => callback(data));
  },

  // Transactions
  createTransaction: (transaction) => ipcRenderer.invoke('create-transaction', transaction),
  getQueueStats: () => ipcRenderer.invoke('get-queue-stats'),
  getQueuedTransactions: () => ipcRenderer.invoke('get-queued-transactions'),
  onTransactionSyncUpdate: (callback) => {
    ipcRenderer.on('transaction-sync-update', (event, data) => callback(data));
  },
  onQueueUpdate: (callback) => {
    ipcRenderer.on('queue-update', (event, data) => callback(data));
  },

  // Manual sync
  syncProductsNow: () => ipcRenderer.invoke('sync-products-now'),
  syncTransactionsNow: () => ipcRenderer.invoke('sync-transactions-now'),
  retryFailedNow: () => ipcRenderer.invoke('retry-failed-now'),

  // Platform detection
  isElectron: true
});
