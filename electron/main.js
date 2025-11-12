const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

// Import database and sync services
const { initDatabase, getDatabase, closeDatabase } = require('./database/init');
const { 
  startScheduler, 
  stopScheduler, 
  syncProductsNow, 
  syncTransactionsNow,
  retryFailedNow,
  getQueueStatsNow,
  addEventListener
} = require('./sync/scheduler');
const { getNetworkStatus, setAuthToken, clearAuthToken } = require('./sync/network');
const { createTransaction, getQueuedTransactions } = require('./sync/transactions');
const { getAllProducts, getAllCategories } = require('./database/queries');

// Check if running in development mode
const isDev = !app.isPackaged;

let mainWindow;

function createWindow() {
  // Create the browser window - Always POS mode (maximized with title bar)
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false, // Don't show until ready
    backgroundColor: '#ffffff',
    title: 'AnekaBuana Store - POS Terminal',
    fullscreen: false, // Explicitly disable fullscreen
    autoHideMenuBar: true, // Auto-hide menu bar
  });

  // Load the app - Always go to POS
  if (isDev) {
    mainWindow.loadURL('http://localhost:3001/pos');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  mainWindow.loadURL('http://localhost:3001/pos').catch((err) => {
    console.error('Failed to load URL:', err);
    // Retry after a delay if Next.js server is not ready yet
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:3001/pos');
    }, 2000);
  });

  // Show window when ready and maximize
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize(); // Maximize window (with title bar)
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Custom menu - Minimal for POS
  const menuTemplate = [
    {
      label: 'POS',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            mainWindow.minimize();
          },
        },
        {
          label: 'Toggle Maximize',
          accelerator: 'CmdOrCtrl+Shift+M',
          click: () => {
            if (mainWindow.isMaximized()) {
              mainWindow.unmaximize();
            } else {
              mainWindow.maximize();
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Exit POS',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent navigation away from app
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Only allow navigation to /pos routes in Electron
    if (isDev && !url.includes('/pos')) {
      event.preventDefault();
    }
  });
}

// Initialize database and sync services
async function initializeApp() {
  try {
    console.log('[Electron] Initializing database...');
    await initDatabase();
    console.log('[Electron] ✓ Database initialized');

    // Start sync scheduler
    console.log('[Electron] Starting sync services...');
    startScheduler({
      productSyncIntervalMs: 5 * 60 * 1000,    // 5 minutes
      transactionSyncIntervalMs: 2 * 60 * 1000, // 2 minutes
      retryIntervalMs: 1 * 60 * 1000,           // 1 minute
      healthCheckIntervalMs: 30 * 1000          // 30 seconds
    });
    console.log('[Electron] ✓ Sync services started');

    // Listen to sync events and send to renderer
    addEventListener('onProductSync', (data) => {
      if (mainWindow) {
        mainWindow.webContents.send('product-sync-update', data);
      }
    });

    addEventListener('onTransactionSync', (data) => {
      if (mainWindow) {
        mainWindow.webContents.send('transaction-sync-update', data);
      }
    });

    addEventListener('onQueueUpdate', (data) => {
      if (mainWindow) {
        mainWindow.webContents.send('queue-update', data);
      }
    });

    addEventListener('onNetworkChange', (data) => {
      if (mainWindow) {
        mainWindow.webContents.send('network-status-change', data);
      }
    });

  } catch (error) {
    console.error('[Electron] Initialization error:', error);
  }
}

// IPC Handlers for renderer process communication
function setupIpcHandlers() {
  // Auth
  ipcMain.handle('set-auth-token', async (event, token) => {
    setAuthToken(token);
    return { success: true };
  });

  ipcMain.handle('clear-auth-token', async () => {
    clearAuthToken();
    return { success: true };
  });

  // Network status
  ipcMain.handle('get-network-status', async () => {
    return getNetworkStatus();
  });

  // Products
  ipcMain.handle('get-products', async (event, filters) => {
    try {
      const products = getAllProducts(filters);
      return { success: true, data: products };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-categories', async () => {
    try {
      const categories = getAllCategories();
      return { success: true, data: categories };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Transactions
  ipcMain.handle('create-transaction', async (event, transaction) => {
    try {
      const transactionId = createTransaction(transaction);
      
      // Trigger immediate sync
      const syncResult = await syncTransactionsNow();
      
      return { 
        success: true, 
        transactionId,
        syncResult 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-queue-stats', async () => {
    return getQueueStatsNow();
  });

  ipcMain.handle('get-queued-transactions', async () => {
    try {
      const transactions = getQueuedTransactions();
      return { success: true, data: transactions };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Manual sync triggers
  ipcMain.handle('sync-products-now', async () => {
    try {
      const result = await syncProductsNow();
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('sync-transactions-now', async () => {
    try {
      const result = await syncTransactionsNow();
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('retry-failed-now', async () => {
    try {
      const result = await retryFailedNow();
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  // Setup IPC handlers
  setupIpcHandlers();

  // Initialize database and sync
  await initializeApp();

  // Create window
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Cleanup on app quit
app.on('before-quit', () => {
  console.log('[Electron] Shutting down...');
  
  // Stop sync services
  stopScheduler();
  
  // Close database
  try {
    closeDatabase();
    console.log('[Electron] ✓ Database closed');
  } catch (error) {
    console.error('[Electron] Error closing database:', error);
  }
});

// Handle app errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
