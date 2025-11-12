const axios = require('axios');
const { getSetting } = require('../database/queries');

// Network status
let networkStatus = 'unknown'; // 'online', 'unstable', 'offline', 'unknown'
let consecutiveFailures = 0;
let lastSuccessTime = null;
let statusListeners = [];

// Timeouts (milliseconds)
const TIMEOUTS = {
  PING: 3000,      // Health check ping
  NORMAL: 5000,    // Normal operations
  CRITICAL: 10000  // Critical operations (transactions)
};

/**
 * Get API base URL from settings
 */
async function getApiUrl() {
  try {
    const setting = getSetting('api_url');
    return setting ? setting.value : 'http://localhost:5000';
  } catch (error) {
    console.error('Failed to get API URL from settings:', error);
    return 'http://localhost:5000';
  }
}

/**
 * Create axios instance with timeout
 */
function createAxiosInstance(timeout = TIMEOUTS.NORMAL) {
  return axios.create({
    timeout,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Health check - 3s timeout
 */
async function checkHealth() {
  try {
    const apiUrl = await getApiUrl();
    const axiosInstance = createAxiosInstance(TIMEOUTS.PING);
    
    const startTime = Date.now();
    const response = await axiosInstance.get(`${apiUrl}/api/sync/health`);
    const responseTime = Date.now() - startTime;

    if (response.data && response.data.status === 'ok') {
      // Success
      consecutiveFailures = 0;
      lastSuccessTime = new Date();
      
      // Determine status based on response time
      if (responseTime < 1000) {
        updateNetworkStatus('online');
      } else if (responseTime < 2000) {
        updateNetworkStatus('unstable');
      } else {
        updateNetworkStatus('unstable');
      }

      return { success: true, responseTime, data: response.data };
    }

    throw new Error('Invalid health response');
  } catch (error) {
    consecutiveFailures++;
    
    // 3 consecutive failures = offline
    if (consecutiveFailures >= 3) {
      updateNetworkStatus('offline');
    } else {
      updateNetworkStatus('unstable');
    }

    return { 
      success: false, 
      error: error.message,
      consecutiveFailures 
    };
  }
}

/**
 * Update network status and notify listeners
 */
function updateNetworkStatus(newStatus) {
  if (networkStatus !== newStatus) {
    const oldStatus = networkStatus;
    networkStatus = newStatus;
    
    console.log(`[Network] Status changed: ${oldStatus} → ${newStatus}`);
    
    // Notify all listeners
    statusListeners.forEach(listener => {
      try {
        listener(newStatus, oldStatus);
      } catch (error) {
        console.error('Error in status listener:', error);
      }
    });
  }
}

/**
 * Subscribe to network status changes
 */
function onStatusChange(callback) {
  statusListeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    statusListeners = statusListeners.filter(l => l !== callback);
  };
}

/**
 * Get current network status
 */
function getNetworkStatus() {
  return {
    status: networkStatus,
    consecutiveFailures,
    lastSuccessTime,
    isOnline: networkStatus === 'online',
    isOffline: networkStatus === 'offline'
  };
}

/**
 * Make API request with appropriate timeout
 */
async function makeRequest(config, timeoutType = 'NORMAL') {
  const timeout = TIMEOUTS[timeoutType] || TIMEOUTS.NORMAL;
  const apiUrl = await getApiUrl();
  
  const axiosInstance = createAxiosInstance(timeout);
  
  // Get token from localStorage or settings
  const token = global.authToken || null;
  
  const requestConfig = {
    ...config,
    url: `${apiUrl}${config.url}`,
    headers: {
      ...config.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  };

  try {
    const response = await axiosInstance.request(requestConfig);
    
    // Update status on success
    if (networkStatus === 'offline' || networkStatus === 'unstable') {
      consecutiveFailures = 0;
      updateNetworkStatus('online');
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    consecutiveFailures++;
    
    if (consecutiveFailures >= 3) {
      updateNetworkStatus('offline');
    } else if (networkStatus === 'online') {
      updateNetworkStatus('unstable');
    }

    return {
      success: false,
      error: error.message,
      code: error.code,
      status: error.response?.status
    };
  }
}

/**
 * Start periodic health checks (every 30s)
 */
let healthCheckInterval = null;

function startHealthCheck(intervalMs = 30000) {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }

  // Initial check
  checkHealth();

  // Periodic checks
  healthCheckInterval = setInterval(async () => {
    await checkHealth();
  }, intervalMs);

  console.log(`[Network] Health check started (every ${intervalMs}ms)`);
}

function stopHealthCheck() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
    console.log('[Network] Health check stopped');
  }
}

/**
 * Set auth token for API requests
 */
function setAuthToken(token) {
  global.authToken = token;
}

/**
 * Clear auth token
 */
function clearAuthToken() {
  global.authToken = null;
}

module.exports = {
  TIMEOUTS,
  checkHealth,
  getNetworkStatus,
  onStatusChange,
  makeRequest,
  startHealthCheck,
  stopHealthCheck,
  setAuthToken,
  clearAuthToken,
  getApiUrl
};
