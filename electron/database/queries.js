const { getDatabase, getOne, getAll, executeQuery, runTransaction } = require('./init');

/**
 * ========================================
 * PRODUCTS
 * ========================================
 */

function getAllProducts(filters = {}) {
  let query = `
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.categoryId) {
    query += ' AND p.category_id = ?';
    params.push(filters.categoryId);
  }

  if (filters.search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.isActive !== undefined) {
    query += ' AND p.is_active = ?';
    params.push(filters.isActive ? 1 : 0);
  }

  query += ' ORDER BY p.created_at DESC';

  return getAll(query, params);
}

function getProductById(id) {
  return getOne('SELECT * FROM products WHERE id = ?', [id]);
}

function getProductWithVariants(productId) {
  const product = getProductById(productId);
  if (!product) return null;

  const variants = getAll(`
    SELECT v.*, 
           GROUP_CONCAT(s.id) as stock_ids,
           GROUP_CONCAT(s.cabang_id) as cabang_ids,
           GROUP_CONCAT(s.quantity) as quantities
    FROM product_variants v
    LEFT JOIN stocks s ON v.id = s.product_variant_id
    WHERE v.product_id = ?
    GROUP BY v.id
  `, [productId]);

  return { ...product, variants };
}

function upsertProduct(product) {
  const query = `
    INSERT INTO products (id, name, description, category_id, product_type, price, is_active, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      category_id = excluded.category_id,
      product_type = excluded.product_type,
      price = excluded.price,
      is_active = excluded.is_active,
      updated_at = datetime('now')
  `;

  return executeQuery(query, [
    product.id,
    product.name,
    product.description,
    product.categoryId,
    product.productType,
    product.price,
    product.isActive ? 1 : 0
  ]);
}

function upsertProductVariant(variant) {
  const query = `
    INSERT INTO product_variants (id, product_id, variant_name, variant_value, sku, price, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      variant_name = excluded.variant_name,
      variant_value = excluded.variant_value,
      sku = excluded.sku,
      price = excluded.price,
      updated_at = datetime('now')
  `;

  return executeQuery(query, [
    variant.id,
    variant.productId,
    variant.variantName,
    variant.variantValue,
    variant.sku,
    variant.price
  ]);
}

function upsertStock(stock) {
  const query = `
    INSERT INTO stocks (id, product_variant_id, cabang_id, cabang_name, quantity, min_stock, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(product_variant_id, cabang_id) DO UPDATE SET
      quantity = excluded.quantity,
      min_stock = excluded.min_stock,
      cabang_name = excluded.cabang_name,
      updated_at = datetime('now')
  `;

  return executeQuery(query, [
    stock.id,
    stock.productVariantId,
    stock.cabangId,
    stock.cabangName || '',
    stock.quantity,
    stock.minStock || 5
  ]);
}

/**
 * ========================================
 * CATEGORIES
 * ========================================
 */

function getAllCategories() {
  return getAll('SELECT * FROM categories ORDER BY name');
}

function upsertCategory(category) {
  const query = `
    INSERT INTO categories (id, name, description, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      updated_at = datetime('now')
  `;

  return executeQuery(query, [category.id, category.name, category.description]);
}

/**
 * ========================================
 * TRANSACTIONS
 * ========================================
 */

function createTransaction(transaction) {
  return runTransaction(() => {
    // Insert transaction
    const txQuery = `
      INSERT INTO transactions (
        id, transaction_no, cabang_id, kasir_id, kasir_name,
        customer_name, customer_phone, subtotal, discount, tax, total,
        payment_method, payment_status, bank_name, reference_no, notes,
        sync_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `;

    executeQuery(txQuery, [
      transaction.id,
      transaction.transactionNo,
      transaction.cabangId,
      transaction.kasirId,
      transaction.kasirName,
      transaction.customerName,
      transaction.customerPhone,
      transaction.subtotal,
      transaction.discount || 0,
      transaction.tax || 0,
      transaction.total,
      transaction.paymentMethod,
      transaction.paymentStatus || 'COMPLETED',
      transaction.bankName,
      transaction.referenceNo,
      transaction.notes,
      transaction.createdAt || new Date().toISOString()
    ]);

    // Insert transaction items
    if (transaction.items && transaction.items.length > 0) {
      const itemQuery = `
        INSERT INTO transaction_items (
          id, transaction_id, product_variant_id, product_name,
          variant_info, sku, quantity, price, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      transaction.items.forEach((item, index) => {
        executeQuery(itemQuery, [
          `${transaction.id}-item-${index}`,
          transaction.id,
          item.productVariantId,
          item.productName,
          item.variantInfo,
          item.sku,
          item.quantity,
          item.price,
          item.subtotal
        ]);

        // Deduct stock
        const updateStockQuery = `
          UPDATE stocks 
          SET quantity = quantity - ?, updated_at = datetime('now')
          WHERE product_variant_id = ? AND cabang_id = ?
        `;
        executeQuery(updateStockQuery, [item.quantity, item.productVariantId, transaction.cabangId]);
      });
    }

    return transaction.id;
  });
}

function getQueuedTransactions() {
  const query = `
    SELECT t.*, 
           GROUP_CONCAT(ti.id) as item_ids
    FROM transactions t
    LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
    WHERE t.sync_status = 'pending'
    GROUP BY t.id
    ORDER BY t.created_at ASC
  `;

  const transactions = getAll(query);

  // Get items for each transaction
  return transactions.map(tx => {
    const items = getAll(
      'SELECT * FROM transaction_items WHERE transaction_id = ?',
      [tx.id]
    );
    return { ...tx, items };
  });
}

function markTransactionAsSynced(localId, serverId) {
  const query = `
    UPDATE transactions 
    SET sync_status = 'synced', 
        synced_at = datetime('now'),
        sync_error = NULL
    WHERE id = ?
  `;
  return executeQuery(query, [localId]);
}

function markTransactionAsFailed(localId, error) {
  const query = `
    UPDATE transactions 
    SET sync_status = 'failed', 
        sync_error = ?,
        sync_retry_count = sync_retry_count + 1
    WHERE id = ?
  `;
  return executeQuery(query, [error, localId]);
}

/**
 * ========================================
 * SETTINGS
 * ========================================
 */

function getSetting(key) {
  return getOne('SELECT value FROM settings WHERE key = ?', [key]);
}

function setSetting(key, value) {
  const query = `
    INSERT INTO settings (id, key, value, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = datetime('now')
  `;
  return executeQuery(query, [`setting-${key}`, key, value]);
}

function getLastSyncTime(type) {
  const key = `last_${type}_sync`;
  const setting = getSetting(key);
  return setting ? setting.value : '2000-01-01T00:00:00Z';
}

function setLastSyncTime(type, timestamp) {
  const key = `last_${type}_sync`;
  return setSetting(key, timestamp);
}

/**
 * ========================================
 * SYNC LOG
 * ========================================
 */

function createSyncLog(syncType, syncDirection, recordsCount = 0) {
  const query = `
    INSERT INTO sync_log (sync_type, sync_direction, status, records_count, started_at)
    VALUES (?, ?, 'running', ?, datetime('now'))
  `;
  const result = executeQuery(query, [syncType, syncDirection, recordsCount]);
  return result.lastInsertRowid;
}

function completeSyncLog(logId, status, recordsCount, errorMessage = null) {
  const query = `
    UPDATE sync_log 
    SET status = ?, records_count = ?, error_message = ?, completed_at = datetime('now')
    WHERE id = ?
  `;
  return executeQuery(query, [status, recordsCount, errorMessage, logId]);
}

function getRecentSyncLogs(limit = 20) {
  return getAll(
    'SELECT * FROM sync_log ORDER BY started_at DESC LIMIT ?',
    [limit]
  );
}

/**
 * ========================================
 * USERS (Cached)
 * ========================================
 */

function upsertUser(user) {
  const query = `
    INSERT INTO users (id, email, name, role, cabang_id, cabang_name, is_active, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      email = excluded.email,
      name = excluded.name,
      role = excluded.role,
      cabang_id = excluded.cabang_id,
      cabang_name = excluded.cabang_name,
      is_active = excluded.is_active,
      updated_at = datetime('now')
  `;

  return executeQuery(query, [
    user.id,
    user.email,
    user.name,
    user.role,
    user.cabangId,
    user.cabang?.name || '',
    user.isActive ? 1 : 0
  ]);
}

function getAllUsers() {
  return getAll('SELECT * FROM users ORDER BY name');
}

module.exports = {
  // Products
  getAllProducts,
  getProductById,
  getProductWithVariants,
  upsertProduct,
  upsertProductVariant,
  upsertStock,
  
  // Categories
  getAllCategories,
  upsertCategory,
  
  // Transactions
  createTransaction,
  getQueuedTransactions,
  markTransactionAsSynced,
  markTransactionAsFailed,
  
  // Settings
  getSetting,
  setSetting,
  getLastSyncTime,
  setLastSyncTime,
  
  // Sync Log
  createSyncLog,
  completeSyncLog,
  getRecentSyncLogs,
  
  // Users
  upsertUser,
  getAllUsers
};
