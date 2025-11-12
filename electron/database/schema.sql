-- SQLite Schema for AnekaBuana POS Desktop App
-- This mirrors PostgreSQL schema but optimized for local SQLite database

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'VARIANT', -- SINGLE or VARIANT
  price REAL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  variant_value TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  price REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(product_id, variant_name, variant_value)
);

-- Stocks (per cabang)
CREATE TABLE IF NOT EXISTS stocks (
  id TEXT PRIMARY KEY,
  product_variant_id TEXT NOT NULL,
  cabang_id TEXT NOT NULL,
  cabang_name TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  UNIQUE(product_variant_id, cabang_id)
);

-- Users (cached from server)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'KASIR',
  cabang_id TEXT,
  cabang_name TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  transaction_no TEXT UNIQUE NOT NULL,
  cabang_id TEXT NOT NULL,
  kasir_id TEXT NOT NULL,
  kasir_name TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  subtotal REAL NOT NULL,
  discount REAL NOT NULL DEFAULT 0,
  tax REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'COMPLETED',
  bank_name TEXT,
  reference_no TEXT,
  notes TEXT,
  -- Sync status
  sync_status TEXT NOT NULL DEFAULT 'pending', -- pending, synced, failed
  sync_error TEXT,
  sync_retry_count INTEGER NOT NULL DEFAULT 0,
  synced_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Transaction Items
CREATE TABLE IF NOT EXISTS transaction_items (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  product_variant_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  variant_info TEXT NOT NULL,
  sku TEXT,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  subtotal REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

-- Settings (local app settings)
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sync Log (track sync history)
CREATE TABLE IF NOT EXISTS sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sync_type TEXT NOT NULL, -- 'products', 'transactions', 'stocks', 'users'
  sync_direction TEXT NOT NULL, -- 'push', 'pull'
  status TEXT NOT NULL, -- 'success', 'failed'
  records_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_stocks_variant ON stocks(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_stocks_cabang ON stocks(cabang_id);
CREATE INDEX IF NOT EXISTS idx_transactions_sync ON transactions(sync_status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_items_tx ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_type ON sync_log(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_log_date ON sync_log(started_at);

-- Insert default settings
INSERT OR IGNORE INTO settings (id, key, value) VALUES 
  ('1', 'last_product_sync', '2000-01-01T00:00:00Z'),
  ('2', 'last_stock_sync', '2000-01-01T00:00:00Z'),
  ('3', 'last_user_sync', '2000-01-01T00:00:00Z'),
  ('4', 'sync_interval', '300000'), -- 5 minutes in ms
  ('5', 'api_url', 'http://localhost:5000/api'),
  ('6', 'low_stock_threshold', '10'),
  ('7', 'critical_stock_threshold', '5');
