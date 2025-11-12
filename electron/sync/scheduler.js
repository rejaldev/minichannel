const { startHealthCheck, stopHealthCheck, onStatusChange } = require('./network');
const { syncProducts } = require('./products');
const { syncQueuedTransactions, retryFailedTransactions, getQueueStats } = require('./transactions');

// Scheduler state
let productSyncInterval = null;
let transactionSyncInterval = null;
let retryInterval = null;
let isRunning = false;

// Event listeners for UI updates
let eventListeners = {
  onProductSync: [],
  onTransactionSync: [],
  onQueueUpdate: [],
  onNetworkChange: []
};

/**
 * Start all sync schedulers
 */
function startScheduler(config = {}) {
  if (isRunning) {
    console.log('[Scheduler] Already running');
    return;
  }

  const {
    productSyncIntervalMs = 5 * 60 * 1000,    // 5 minutes
    transactionSyncIntervalMs = 2 * 60 * 1000, // 2 minutes
    retryIntervalMs = 1 * 60 * 1000,           // 1 minute
    healthCheckIntervalMs = 30 * 1000          // 30 seconds
  } = config;

  console.log('[Scheduler] Starting sync services...');
  console.log(`  - Health check: every ${healthCheckIntervalMs / 1000}s`);
  console.log(`  - Product sync: every ${productSyncIntervalMs / 1000}s`);
  console.log(`  - Transaction sync: every ${transactionSyncIntervalMs / 1000}s`);
  console.log(`  - Retry failed: every ${retryIntervalMs / 1000}s`);

  // Start health check
  startHealthCheck(healthCheckIntervalMs);

  // Listen to network status changes
  onStatusChange((newStatus, oldStatus) => {
    console.log(`[Scheduler] Network status: ${oldStatus} → ${newStatus}`);
    notifyListeners('onNetworkChange', { status: newStatus, previousStatus: oldStatus });

    // When coming back online, trigger immediate sync
    if (oldStatus === 'offline' && (newStatus === 'online' || newStatus === 'unstable')) {
      console.log('[Scheduler] Back online - triggering immediate sync');
      syncProductsNow();
      syncTransactionsNow();
    }
  });

  // Initial sync on startup
  setTimeout(() => {
    syncProductsNow();
    syncTransactionsNow();
  }, 2000); // Wait 2s for app to initialize

  // Product sync interval (5 minutes)
  productSyncInterval = setInterval(async () => {
    await syncProductsNow();
  }, productSyncIntervalMs);

  // Transaction sync interval (2 minutes)
  transactionSyncInterval = setInterval(async () => {
    await syncTransactionsNow();
  }, transactionSyncIntervalMs);

  // Retry failed transactions (1 minute)
  retryInterval = setInterval(async () => {
    await retryFailedNow();
  }, retryIntervalMs);

  isRunning = true;
  console.log('[Scheduler] ✓ All sync services started');
}

/**
 * Stop all sync schedulers
 */
function stopScheduler() {
  if (!isRunning) {
    return;
  }

  console.log('[Scheduler] Stopping sync services...');

  stopHealthCheck();

  if (productSyncInterval) {
    clearInterval(productSyncInterval);
    productSyncInterval = null;
  }

  if (transactionSyncInterval) {
    clearInterval(transactionSyncInterval);
    transactionSyncInterval = null;
  }

  if (retryInterval) {
    clearInterval(retryInterval);
    retryInterval = null;
  }

  isRunning = false;
  console.log('[Scheduler] ✓ All sync services stopped');
}

/**
 * Sync products immediately
 */
async function syncProductsNow() {
  console.log('[Scheduler] Running product sync...');
  
  try {
    const result = await syncProducts();
    
    notifyListeners('onProductSync', result);
    
    if (result.success && result.count > 0) {
      console.log(`[Scheduler] ✓ Product sync completed: ${result.count} products updated`);
    }
    
    return result;
  } catch (error) {
    console.error('[Scheduler] Product sync error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sync transactions immediately
 */
async function syncTransactionsNow() {
  console.log('[Scheduler] Running transaction sync...');
  
  try {
    const result = await syncQueuedTransactions();
    const stats = getQueueStats();
    
    notifyListeners('onTransactionSync', result);
    notifyListeners('onQueueUpdate', stats);
    
    if (result.success) {
      console.log(`[Scheduler] ✓ Transaction sync completed: ${result.count} synced, ${result.queued || 0} still queued`);
    }
    
    return result;
  } catch (error) {
    console.error('[Scheduler] Transaction sync error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Retry failed transactions immediately
 */
async function retryFailedNow() {
  const stats = getQueueStats();
  
  if (stats.failed === 0) {
    return { success: true, retried: 0 };
  }

  console.log(`[Scheduler] Retrying ${stats.failed} failed transactions...`);
  
  try {
    const result = await retryFailedTransactions();
    
    if (result.retried > 0) {
      const updatedStats = getQueueStats();
      notifyListeners('onQueueUpdate', updatedStats);
    }
    
    return result;
  } catch (error) {
    console.error('[Scheduler] Retry failed error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get current queue statistics
 */
function getQueueStatsNow() {
  return getQueueStats();
}

/**
 * Register event listener
 */
function addEventListener(event, callback) {
  if (eventListeners[event]) {
    eventListeners[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      eventListeners[event] = eventListeners[event].filter(cb => cb !== callback);
    };
  }
  
  console.warn(`[Scheduler] Unknown event: ${event}`);
  return () => {};
}

/**
 * Notify all listeners of an event
 */
function notifyListeners(event, data) {
  if (eventListeners[event]) {
    eventListeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[Scheduler] Error in ${event} listener:`, error);
      }
    });
  }
}

/**
 * Get scheduler status
 */
function getSchedulerStatus() {
  return {
    isRunning,
    hasProductSync: productSyncInterval !== null,
    hasTransactionSync: transactionSyncInterval !== null,
    hasRetryInterval: retryInterval !== null
  };
}

module.exports = {
  startScheduler,
  stopScheduler,
  syncProductsNow,
  syncTransactionsNow,
  retryFailedNow,
  getQueueStatsNow,
  addEventListener,
  getSchedulerStatus
};
