// Electron API type definitions
export interface ElectronAPI {
  setAuthToken: (token: string) => Promise<{ success: boolean }>;
  clearAuthToken: () => Promise<{ success: boolean }>;
  
  getNetworkStatus: () => Promise<{
    status: string;
    consecutiveFailures: number;
    lastSuccessTime: Date | null;
    isOnline: boolean;
    isOffline: boolean;
  }>;
  onNetworkStatusChange: (callback: (data: any) => void) => void;
  
  getProducts: (filters?: any) => Promise<{ success: boolean; data?: any[]; error?: string }>;
  getCategories: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
  onProductSyncUpdate: (callback: (data: any) => void) => void;
  
  createTransaction: (transaction: any) => Promise<{ 
    success: boolean; 
    transactionId?: string; 
    syncResult?: any;
    error?: string;
  }>;
  getQueueStats: () => Promise<{
    total: number;
    pending: number;
    failed: number;
    warningLevel: string;
    oldestTransaction?: string;
  }>;
  getQueuedTransactions: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
  onTransactionSyncUpdate: (callback: (data: any) => void) => void;
  onQueueUpdate: (callback: (data: any) => void) => void;
  
  syncProductsNow: () => Promise<any>;
  syncTransactionsNow: () => Promise<any>;
  retryFailedNow: () => Promise<any>;
  
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
