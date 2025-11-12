const { makeRequest } = require('./network');
const { 
  upsertProduct, 
  upsertProductVariant, 
  upsertStock,
  upsertCategory,
  getLastSyncTime,
  setLastSyncTime,
  createSyncLog,
  completeSyncLog
} = require('../database/queries');

/**
 * Sync products from server (delta sync)
 * Only fetch products updated after last sync
 */
async function syncProducts() {
  const logId = createSyncLog('products', 'pull', 0);
  
  try {
    // Get last sync timestamp
    const lastSync = getLastSyncTime('products');
    console.log(`[Product Sync] Last sync: ${lastSync}`);

    // Fetch delta products
    const result = await makeRequest({
      method: 'GET',
      url: `/api/sync/products/delta?updatedAfter=${lastSync}`
    }, 'NORMAL');

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch products');
    }

    const { products, categories, count } = result.data;
    console.log(`[Product Sync] Received ${count} products, ${categories?.length || 0} categories`);

    // Update categories first
    if (categories && categories.length > 0) {
      categories.forEach(category => {
        try {
          upsertCategory({
            id: category.id,
            name: category.name,
            description: category.description || ''
          });
        } catch (error) {
          console.error(`Failed to upsert category ${category.id}:`, error);
        }
      });
    }

    // Update products, variants, and stocks
    let successCount = 0;
    const updatedProducts = [];

    products.forEach(product => {
      try {
        // Upsert product
        upsertProduct({
          id: product.id,
          name: product.name,
          description: product.description || '',
          categoryId: product.categoryId,
          productType: product.productType,
          price: product.price,
          isActive: product.isActive
        });

        // Upsert variants
        if (product.variants && product.variants.length > 0) {
          product.variants.forEach(variant => {
            upsertProductVariant({
              id: variant.id,
              productId: product.id,
              variantName: variant.variantName || '',
              variantValue: variant.variantValue || '',
              sku: variant.sku,
              price: variant.price
            });

            // Upsert stocks for this variant
            if (variant.stocks && variant.stocks.length > 0) {
              variant.stocks.forEach(stock => {
                upsertStock({
                  id: stock.id,
                  productVariantId: variant.id,
                  cabangId: stock.cabangId,
                  cabangName: stock.cabang?.name || '',
                  quantity: stock.quantity,
                  minStock: stock.minStock || 5
                });
              });
            }
          });
        }

        successCount++;
        updatedProducts.push({
          id: product.id,
          name: product.name,
          type: product.productType
        });
      } catch (error) {
        console.error(`Failed to sync product ${product.id}:`, error);
      }
    });

    // Update last sync time
    const now = new Date().toISOString();
    setLastSyncTime('products', now);

    // Complete sync log
    completeSyncLog(logId, 'success', successCount);

    console.log(`[Product Sync] Success: ${successCount}/${count} products synced`);

    return {
      success: true,
      count: successCount,
      updatedProducts,
      timestamp: now
    };

  } catch (error) {
    console.error('[Product Sync] Error:', error);
    completeSyncLog(logId, 'failed', 0, error.message);

    return {
      success: false,
      error: error.message,
      count: 0
    };
  }
}

/**
 * Force full product sync (ignore last sync time)
 */
async function forceFullSync() {
  console.log('[Product Sync] Starting full sync...');
  
  // Reset last sync time to fetch all
  setLastSyncTime('products', '2000-01-01T00:00:00Z');
  
  return await syncProducts();
}

module.exports = {
  syncProducts,
  forceFullSync
};
