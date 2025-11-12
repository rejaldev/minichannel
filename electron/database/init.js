const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, '../../data/store.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db = null;

/**
 * Initialize database connection and create tables if needed
 */
function initDatabase() {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Open database connection
    db = new Database(DB_PATH, {
      verbose: console.log // Log SQL queries in development
    });

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Create tables if database is new
    const isNewDb = !fs.existsSync(DB_PATH) || fs.statSync(DB_PATH).size === 0;
    if (isNewDb) {
      console.log('📦 Creating new database...');
      createTables();
      console.log('✅ Database initialized successfully');
    } else {
      console.log('✅ Database connected');
    }

    return db;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

/**
 * Create all tables from schema.sql
 */
function createTables() {
  try {
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema);
    console.log('✅ Tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

/**
 * Get database instance (singleton)
 */
function getDatabase() {
  if (!db) {
    return initDatabase();
  }
  return db;
}

/**
 * Close database connection
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('✅ Database connection closed');
  }
}

/**
 * Execute query with error handling
 */
function executeQuery(query, params = []) {
  try {
    const db = getDatabase();
    const stmt = db.prepare(query);
    return stmt.run(params);
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

/**
 * Get single record
 */
function getOne(query, params = []) {
  try {
    const db = getDatabase();
    const stmt = db.prepare(query);
    return stmt.get(params);
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

/**
 * Get multiple records
 */
function getAll(query, params = []) {
  try {
    const db = getDatabase();
    const stmt = db.prepare(query);
    return stmt.all(params);
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

/**
 * Run transaction
 */
function runTransaction(callback) {
  const db = getDatabase();
  const transaction = db.transaction(callback);
  return transaction();
}

/**
 * Backup database
 */
function backupDatabase() {
  try {
    const backupPath = `${DB_PATH}.backup.${Date.now()}`;
    fs.copyFileSync(DB_PATH, backupPath);
    console.log('✅ Database backed up to:', backupPath);
    return backupPath;
  } catch (error) {
    console.error('❌ Backup error:', error);
    throw error;
  }
}

/**
 * Get database statistics
 */
function getStats() {
  const db = getDatabase();
  
  const stats = {
    products: db.prepare('SELECT COUNT(*) as count FROM products').get().count,
    variants: db.prepare('SELECT COUNT(*) as count FROM product_variants').get().count,
    transactions: db.prepare('SELECT COUNT(*) as count FROM transactions').get().count,
    pendingSync: db.prepare("SELECT COUNT(*) as count FROM transactions WHERE sync_status = 'pending'").get().count,
    failedSync: db.prepare("SELECT COUNT(*) as count FROM transactions WHERE sync_status = 'failed'").get().count,
    categories: db.prepare('SELECT COUNT(*) as count FROM categories').get().count,
    users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
  };

  return stats;
}

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase,
  executeQuery,
  getOne,
  getAll,
  runTransaction,
  backupDatabase,
  getStats
};
