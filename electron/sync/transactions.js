const { makeRequest, getNetworkStatus } = require('./network');
const { 
  getQueuedTransactions,
  markTransactionAsSynced,
  markTransactionAsFailed,
  createSyncLog,
  completeSyncLog
} = require('../database/queries');

/**
 * Sync single transaction to server (immediate sync)
 * Called right after transaction creation
 */
async function syncTransaction(transaction) {
  try {
    console.log(`[Transaction Sync] Syncing transaction ${transaction.id}...`);

    // Transform transaction to API format
    const payload = {
      id: transaction.id,
      transactionNo: transaction.transaction_no,
      cabangId: transaction.cabang_id,
      kasirId: transaction.kasir_id,
      kasirName: transaction.kasir_name,
      customerName: transaction.customer_name,
      customerPhone: transaction.customer_phone,
      subtotal: parseFloat(transaction.subtotal),
      discount: parseFloat(transaction.discount || 0),
      tax: parseFloat(transaction.tax || 0),
      total: parseFloat(transaction.total),
      paymentMethod: transaction.payment_method,
      paymentStatus: transaction.payment_status,
      bankName: transaction.bank_name,
      referenceNo: transaction.reference_no,
      notes: transaction.notes,
      createdAt: transaction.created_at,
      items: transaction.items.map(item => ({
        productVariantId: item.product_variant_id,
        productName: item.product_name,
        variantInfo: item.variant_info,
        sku: item.sku,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        subtotal: parseFloat(item.subtotal)
      }))
    };

    // Send to API with 10s critical timeout
    const result = await makeRequest({
      method: 'POST',
      url: '/api/sync/transactions/batch',
      data: { transactions: [payload] }
    }, 'CRITICAL');

    if (!result.success) {
      throw new Error(result.error || 'Sync failed');
    }

    const { success, failed } = result.data;

    if (success > 0) {
      // Mark as synced
      markTransactionAsSynced(transaction.id, null);
      console.log(`[Transaction Sync] ✓ Transaction ${transaction.id} synced successfully`);
      
      return { success: true, transactionId: transaction.id };
    } else if (failed > 0) {
      const error = result.data.errors?.[0]?.error || 'Unknown error';
      markTransactionAsFailed(transaction.id, error);
      
      return { 
        success: false, 
        error,
        transactionId: transaction.id,
        shouldRetry: true 
      };
    }

    throw new Error('No response from server');

  } catch (error) {
    console.error(`[Transaction Sync] ✗ Failed to sync ${transaction.id}:`, error.message);
    
    // Mark as failed
    markTransactionAsFailed(transaction.id, error.message);

    return {
      success: false,
      error: error.message,
      transactionId: transaction.id,
      shouldRetry: true
    };
  }
}

/**
 * Sync all queued transactions (batch sync)
 * Called periodically or manually
 */
async function syncQueuedTransactions() {
  const logId = createSyncLog('transactions', 'push', 0);

  try {
    // Check network status
    const networkStatus = getNetworkStatus();
    if (networkStatus.isOffline) {
      console.log('[Transaction Sync] Network offline, skipping batch sync');
      completeSyncLog(logId, 'skipped', 0, 'Network offline');
      return { success: false, error: 'Network offline', count: 0 };
    }

    // Get all pending transactions
    const queuedTransactions = getQueuedTransactions();
    
    if (queuedTransactions.length === 0) {
      console.log('[Transaction Sync] No queued transactions to sync');
      completeSyncLog(logId, 'success', 0);
      return { success: true, count: 0, queued: 0 };
    }

    console.log(`[Transaction Sync] Found ${queuedTransactions.length} queued transactions`);

    // Transform to API format
    const payload = queuedTransactions.map(tx => ({
      id: tx.id,
      transactionNo: tx.transaction_no,
      cabangId: tx.cabang_id,
      kasirId: tx.kasir_id,
      kasirName: tx.kasir_name,
      customerName: tx.customer_name,
      customerPhone: tx.customer_phone,
      subtotal: parseFloat(tx.subtotal),
      discount: parseFloat(tx.discount || 0),
      tax: parseFloat(tx.tax || 0),
      total: parseFloat(tx.total),
      paymentMethod: tx.payment_method,
      paymentStatus: tx.payment_status,
      bankName: tx.bank_name,
      referenceNo: tx.reference_no,
      notes: tx.notes,
      createdAt: tx.created_at,
      items: tx.items.map(item => ({
        productVariantId: item.product_variant_id,
        productName: item.product_name,
        variantInfo: item.variant_info,
        sku: item.sku,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        subtotal: parseFloat(item.subtotal)
      }))
    }));

    // Send batch to API
    const result = await makeRequest({
      method: 'POST',
      url: '/api/sync/transactions/batch',
      data: { transactions: payload }
    }, 'CRITICAL');

    if (!result.success) {
      throw new Error(result.error || 'Batch sync failed');
    }

    const { success, failed, errors } = result.data;
    console.log(`[Transaction Sync] Batch result: ${success} success, ${failed} failed`);

    // Update local status based on server response
    queuedTransactions.forEach((tx, index) => {
      const error = errors?.find(e => e.id === tx.id);
      
      if (error) {
        markTransactionAsFailed(tx.id, error.error);
      } else {
        markTransactionAsSynced(tx.id, null);
      }
    });

    completeSyncLog(logId, 'success', success);

    return {
      success: true,
      count: success,
      failed,
      queued: queuedTransactions.length - success
    };

  } catch (error) {
    console.error('[Transaction Sync] Batch sync error:', error);
    completeSyncLog(logId, 'failed', 0, error.message);

    return {
      success: false,
      error: error.message,
      count: 0
    };
  }
}

/**
 * Get queue statistics
 */
function getQueueStats() {
  const queued = getQueuedTransactions();
  const total = queued.length;
  const failed = queued.filter(tx => tx.sync_status === 'failed').length;
  const pending = queued.filter(tx => tx.sync_status === 'pending').length;

  // Soft warnings
  let warningLevel = 'none';
  if (total >= 200) {
    warningLevel = 'critical';
  } else if (total >= 50) {
    warningLevel = 'warning';
  }

  return {
    total,
    pending,
    failed,
    warningLevel,
    oldestTransaction: queued.length > 0 ? queued[0].created_at : null
  };
}

/**
 * Retry failed transactions with exponential backoff
 */
async function retryFailedTransactions() {
  const queued = getQueuedTransactions();
  const failed = queued.filter(tx => tx.sync_status === 'failed');

  if (failed.length === 0) {
    return { success: true, retried: 0 };
  }

  console.log(`[Transaction Sync] Retrying ${failed.length} failed transactions...`);

  let retried = 0;
  for (const tx of failed) {
    // Exponential backoff: don't retry if recently failed
    const retryCount = tx.sync_retry_count || 0;
    const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 300000); // Max 5 minutes
    
    // Check if enough time has passed
    const lastAttempt = new Date(tx.updated_at).getTime();
    const now = Date.now();
    
    if (now - lastAttempt < backoffMs) {
      console.log(`[Transaction Sync] Skipping ${tx.id} - backoff not elapsed`);
      continue;
    }

    // Retry sync
    const result = await syncTransaction(tx);
    if (result.success) {
      retried++;
    }

    // Small delay between retries
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return { success: true, retried };
}

module.exports = {
  syncTransaction,
  syncQueuedTransactions,
  getQueueStats,
  retryFailedTransactions
};
