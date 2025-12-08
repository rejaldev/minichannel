/**
 * QZ Tray Print Library for Web-based Thermal Printing
 * Requires QZ Tray to be installed: https://qz.io/download/
 */

declare global {
  interface Window {
    qz: any;
  }
}

// QZ Tray connection state
let qzConnection: Promise<void> | null = null;
let isConnected = false;
let certificateConfigured = false;

// Demo certificate for QZ Tray (auto-trust without prompt)
const DEMO_CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIECzCCAvOgAwIBAgIGAZrvpquaMA0GCSqGSIb3DQEBCwUAMIGiMQswCQYDVQQG
EwJVUzELMAkGA1UECAwCTlkxEjAQBgNVBAcMCUNhbmFzdG90YTEbMBkGA1UECgwS
UVogSW5kdXN0cmllcywgTExDMRswGQYDVQQLDBJRWiBJbmR1c3RyaWVzLCBMTEMx
HDAaBgkqhkiG9w0BCQEWDXN1cHBvcnRAcXouaW8xGjAYBgNVBAMMEVFaIFRyYXkg
RGVtbyBDZXJ0MB4XDTI1MTIwNDE3NTQyOFoXDTQ1MTIwNDE3NTQyOFowgaIxCzAJ
BgNVBAYTAlVTMQswCQYDVQQIDAJOWTESMBAGA1UEBwwJQ2FuYXN0b3RhMRswGQYD
VQQKDBJRWiBJbmR1c3RyaWVzLCBMTEMxGzAZBgNVBAsMElFaIEluZHVzdHJpZXMs
IExMQzEcMBoGCSqGSIb3DQEJARYNc3VwcG9ydEBxei5pbzEaMBgGA1UEAwwRUVog
VHJheSBEZW1vIENlcnQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDE
xJsmV4D96F5J3XleYShgvvDU/IY5VjBFL3cnzNqHKsT/MN0Fm1J43JG8eGE/FkEP
Uf0jcOFZ/15jaRy+eEKqyHWadUcrvcfnFFZvGHWvUkS0dDjTdqlhwRb67z2EZUAM
FtM0H3MNQmRuRBYBDcdcztUY/NccNElAGx21cSt0Zvm8XEv6Jigj+EaAc4ePRqi9
fVMpq+p+jgf7YU2P5apbe4pcpm7OfoFYLanf6HRzVeLDHuWUx5K04SGc83gQ+Ba+
Vj5EvO1pHa2kpzDCioTmmWQypf8+3OZauDW1x1boKc0XEe0KfQVPnqx1VFzgX3KI
v8hxQ2Nl9IPmbl+dbecjAgMBAAGjRTBDMBIGA1UdEwEB/wQIMAYBAf8CAQEwDgYD
VR0PAQH/BAQDAgEGMB0GA1UdDgQWBBS/8hEW+h91c0AgDGByfC28rtW6HzANBgkq
hkiG9w0BAQsFAAOCAQEAMQr1KqDEG7wYu6z2KyEEjUi4V+BtI327Sp57Slmr4UJV
6DuJXXnWuYKHKjWNkRNQfO3MTvju1CHci3bC34Lf1IopK5YRjbKgmgGmN3msLRNr
2l/VdXyms2YnXXNnA996ZWEVsaOKZSpQThn37jbOJtDvNJz/PJg2e9zszj6qYmMA
cpl3UM9I3m/69REFtJSCtEAOjH2QiPJ78A/f3MiC8n33Bmzu2i3U8arcflm67zkd
DFV01HdspqB4KY3PQiKRmtbyqYDnl/M5sLRgoJb/yH5DAjwFdhqXdGQUu4TW6wgm
VPR1pXUONP16YUDzbfUMwHb50y6sVpHoW3qvxJ/dGw==
-----END CERTIFICATE-----`;

// Demo private key for signing
const DEMO_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQDExJsmV4D96F5J
3XleYShgvvDU/IY5VjBFL3cnzNqHKsT/MN0Fm1J43JG8eGE/FkEPUf0jcOFZ/15j
aRy+eEKqyHWadUcrvcfnFFZvGHWvUkS0dDjTdqlhwRb67z2EZUAMFtM0H3MNQmRu
RBYBDcdcztUY/NccNElAGx21cSt0Zvm8XEv6Jigj+EaAc4ePRqi9fVMpq+p+jgf7
YU2P5apbe4pcpm7OfoFYLanf6HRzVeLDHuWUx5K04SGc83gQ+Ba+Vj5EvO1pHa2k
pzDCioTmmWQypf8+3OZauDW1x1boKc0XEe0KfQVPnqx1VFzgX3KIv8hxQ2Nl9IPm
bl+dbecjAgMBAAECggEAJfAyaeYdPNd8tok5SXU6L80g6i/2QT/Y9r38H3Rj/gPF
D97//oDAGgWNI+Wh+mP0D1wjjp3JFW0jac9ud1sAn6Ue57UND+X7kRZew/TXXAJk
tNZjzoHmjq6IG8Hc/pX3D12nQzl9GWVfr9L42yMo+T/33mWBpDKAnRedVsqHMl4B
f+/K4Bq3Aen2DaeLsVtYPryOyHgfV1i1xx3PTCLPQRkGJ4OrZ++TCJS09QO824rJ
KR9TGRYYwKqOFBED+S4IJiy1+GDoTRj6y0aGa/eOBsQ8Av3K05TLjVVitI3IBflH
NlHx5UzlaxrN6zdTUs9hH7Nb56Kunh/ZjLshK/jUIQKBgQD23e7RxB5c2dwD9HpA
8JOAnDvF4V96IAUAYkCIWq7xtENv6clZzsFuP6qJnwGblraiyWeLvn8MRpK5fnKF
R2F1v6pEVZoavRKCSSNdy+xzQjzvihmGYrAaCNS/5RXAYS3VZtv6dzoGdT47GI8a
4Endagm5T0/gzPkdKQObUsZO1QKBgQDMDDAnzBTHOY8XhfHLBKpfRlr3lXgfV3vg
8kdLsSjgSGYRMwysYvM6o6kFUF2xP6h5WjkWuqACXQ8kJ+wpSCEtbhT/vy8ggl0u
rMUGiMVARefdx9++HrcRKMh5QrRpoxQDCrUC4RU8HjOG4Kz51T3HYeHT6ft8vxng
2lV/BaaKFwJ/awnPgySGBbxwqUZXu9CUJC+ZuzL9MvavNHtlf7nSIPsIQn4bz9TW
CfeQ+hr3l37BsdOiEfWHIMt40vUAsslAeM2iBf8X0oAohlUwAHtrCo6t3S8D4kDo
GmG53Xp28/Mu7FitCOypPCOZ2AXOBtk5LcfMb4z0FYTKftpJtg8t7QKBgQCfkySR
6xuQ1qXeWqVHBWYMTqRTnbQspqk9uZwiSPFTvar85nSR2GypvlYvzrMHLGagSPv+
l4MNdiOiPgqGGl+//Kg1fhnoDau8Feeb/ZhtdH4pxudm8vRuWfu2QYGAX8YFvvji
wI5vzpqzb8A3PhordJQ8u28vFvCxFW7pgMzGjwKBgG5HKANzLcHKaDSgBbsbVksg
0HbfcgumvF82HEcfaCmFFUjuMWIuBpeKp0961GsIPI9y1pvnncsQ8ovEj6iLJATh
BDFChtsm0SiykWVLDT8iJTk0LpkN09BesllkTacmjfNyG0B35NeMnOP/R0aBwacu
l96s5MGu3MYM6BrTWtHH
-----END PRIVATE KEY-----`;

/**
 * Configure QZ Tray certificate and signing
 */
function configureCertificate(): void {
  if (certificateConfigured || !window.qz) return;
  
  // Set certificate promise
  window.qz.security.setCertificatePromise((resolve: (cert: string) => void) => {
    resolve(DEMO_CERTIFICATE);
  });
  
  // Set signature promise using the private key
  window.qz.security.setSignatureAlgorithm('SHA512');
  window.qz.security.setSignaturePromise((toSign: string) => {
    return (resolve: (signature: string) => void, reject: (error: Error) => void) => {
      try {
        // Use SubtleCrypto for signing
        const crypto = window.crypto;
        const encoder = new TextEncoder();
        const data = encoder.encode(toSign);
        
        // Convert PEM to ArrayBuffer
        const pemContents = DEMO_PRIVATE_KEY
          .replace('-----BEGIN PRIVATE KEY-----', '')
          .replace('-----END PRIVATE KEY-----', '')
          .replace(/\s/g, '');
        const binaryString = atob(pemContents);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        crypto.subtle.importKey(
          'pkcs8',
          bytes.buffer,
          { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-512' },
          false,
          ['sign']
        ).then((key) => {
          return crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, data);
        }).then((signature) => {
          const signatureArray = new Uint8Array(signature);
          let binary = '';
          signatureArray.forEach(byte => binary += String.fromCharCode(byte));
          resolve(btoa(binary));
        }).catch(reject);
      } catch (error) {
        reject(error as Error);
      }
    };
  });
  
  certificateConfigured = true;
}

/**
 * Load QZ Tray script dynamically
 */
export async function loadQZTray(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  // Check if already loaded
  if (window.qz) return;
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qz-tray@2.2.4/qz-tray.min.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load QZ Tray script'));
    document.head.appendChild(script);
  });
}

/**
 * Connect to QZ Tray
 */
export async function connectQZ(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('QZ Tray only works in browser');
  }
  
  // Load script if not loaded
  await loadQZTray();
  
  if (!window.qz) {
    throw new Error('QZ Tray not loaded');
  }
  
  // Configure certificate for auto-trust (no prompt)
  configureCertificate();
  
  // Already connected - check actual websocket state
  if (window.qz.websocket.isActive()) {
    isConnected = true;
    return;
  }
  
  // Reuse existing connection promise if still connecting
  if (qzConnection) {
    return qzConnection;
  }
  
  qzConnection = new Promise(async (resolve, reject) => {
    try {
      // Setup connection event handlers
      window.qz.websocket.setClosedCallbacks(() => {
        isConnected = false;
        qzConnection = null;
      });
      
      window.qz.websocket.setErrorCallbacks((error: any) => {
        console.error('QZ Tray error:', error);
      });
      
      await window.qz.websocket.connect();
      isConnected = true;
      resolve();
    } catch (error: any) {
      qzConnection = null;
      isConnected = false;
      if (error.message?.includes('Unable to establish')) {
        reject(new Error('QZ Tray tidak terdeteksi. Pastikan QZ Tray sudah diinstall dan berjalan.'));
      } else if (error.message?.includes('already exists')) {
        // Connection already exists, treat as success
        isConnected = true;
        resolve();
      } else {
        reject(error);
      }
    }
  });
  
  return qzConnection;
}

/**
 * Disconnect from QZ Tray
 */
export async function disconnectQZ(): Promise<void> {
  if (typeof window === 'undefined' || !window.qz) return;
  
  if (isConnected) {
    await window.qz.websocket.disconnect();
    isConnected = false;
    qzConnection = null;
  }
}

/**
 * Get list of available printers
 */
export async function getPrinters(): Promise<string[]> {
  await connectQZ();
  return window.qz.printers.find();
}

/**
 * Get default printer
 */
export async function getDefaultPrinter(): Promise<string> {
  await connectQZ();
  return window.qz.printers.getDefault();
}

/**
 * Print receipt using ESC/POS commands
 */
export interface PrintReceiptOptions {
  printerName: string;
  storeName: string;
  branchName?: string;
  address?: string;
  phone?: string;
  cashierName?: string;
  transactionNo: string;
  items: Array<{
    name: string;
    variant?: string;
    qty: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount?: number;
  discountType?: 'PERCENTAGE' | 'NOMINAL';
  discountValue?: number;
  tax?: number;
  total: number;
  paymentMethod: string;
  cashReceived?: number;
  change?: number;
  splitPayments?: Array<{
    method: string;
    amount: number;
  }>;
  customerName?: string;
  customerPhone?: string;
  date: Date | string;
  paperWidth?: 58 | 80;
  footerText1?: string;
  footerText2?: string;
}

export async function printReceipt(options: PrintReceiptOptions): Promise<void> {
  const {
    printerName,
    storeName,
    branchName,
    address,
    phone,
    cashierName,
    transactionNo,
    items,
    subtotal,
    discount = 0,
    discountType,
    discountValue,
    tax = 0,
    total,
    paymentMethod,
    cashReceived,
    change,
    splitPayments,
    customerName,
    customerPhone,
    date,
    paperWidth = 58,
    footerText1 = 'Terima Kasih',
    footerText2 = 'Selamat Berbelanja',
  } = options;
  
  await connectQZ();
  
  const config = window.qz.configs.create(printerName);
  const charWidth = paperWidth === 58 ? 32 : 48;
  
  // Helper functions
  const center = (text: string) => {
    const padding = Math.max(0, Math.floor((charWidth - text.length) / 2));
    return ' '.repeat(padding) + text;
  };
  
  const leftRight = (left: string, right: string) => {
    const spaces = Math.max(1, charWidth - left.length - right.length);
    return left + ' '.repeat(spaces) + right;
  };
  
  const line = (char: string = '-') => char.repeat(charWidth);
  
  const formatCurrency = (amount: number) => {
    return 'Rp ' + amount.toLocaleString('id-ID');
  };
  
  const formatDate = (d: Date | string) => {
    if (typeof d === 'string') return d;
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Build ESC/POS commands
  const data = [
    '\x1B\x40', // Initialize printer
    '\x1B\x61\x01', // Center align
    '\x1B\x21\x30', // Double height + width
    storeName + '\n',
    '\x1B\x21\x00', // Normal text
  ];
  
  if (branchName) {
    data.push(branchName + '\n');
  }
  if (address) {
    data.push(address + '\n');
  }
  if (phone) {
    data.push('Telp: ' + phone + '\n');
  }
  
  data.push(
    '\x1B\x61\x00', // Left align
    line() + '\n',
  );
  
  // Transaction info - table layout with fixed label width
  const labelWidth = paperWidth === 58 ? 8 : 10;
  const padLabel = (label: string) => label.padEnd(labelWidth);
  
  data.push(padLabel('Nomor') + ': ' + transactionNo + '\n');
  data.push(padLabel('Tanggal') + ': ' + formatDate(date) + '\n');
  if (cashierName) {
    data.push(padLabel('Kasir') + ': ' + cashierName + '\n');
  }
  
  if (customerName) {
    data.push(padLabel('Pelanggan') + ': ' + customerName + '\n');
    if (customerPhone) {
      data.push(padLabel('Telp') + ': ' + customerPhone + '\n');
    }
  }
  
  data.push(line() + '\n');
  
  // Items
  for (const item of items) {
    let itemName = item.name;
    
    // Truncate long names
    if (itemName.length > charWidth - 2) {
      itemName = itemName.substring(0, charWidth - 5) + '...';
    }
    
    data.push(itemName + '\n');
    data.push(
      leftRight(
        `${item.qty} x ${formatCurrency(item.price)}`,
        formatCurrency(item.subtotal)
      ) + '\n'
    );
  }
  
  data.push(line() + '\n');
  
  // Totals
  data.push(leftRight('Subtotal', formatCurrency(subtotal)) + '\n');
  
  if (discount > 0) {
    let discountLabel = 'Diskon';
    if (discountType === 'PERCENTAGE' && discountValue) {
      discountLabel += ` (${discountValue}%)`;
    }
    data.push(leftRight(discountLabel, '-' + formatCurrency(discount)) + '\n');
  }
  
  if (tax > 0) {
    data.push(leftRight('Pajak', formatCurrency(tax)) + '\n');
  }
  
  data.push(line() + '\n');
  
  // Grand Total - Bold only
  data.push(
    '\x1B\x21\x08', // Bold
    leftRight('GRAND TOTAL', formatCurrency(total)) + '\n',
    '\x1B\x21\x00', // Normal text
  );
  
  // Payment info
  if (splitPayments && splitPayments.length > 1) {
    data.push('Pembayaran Split:\n');
    for (const payment of splitPayments) {
      data.push(leftRight(`  ${payment.method}`, formatCurrency(payment.amount)) + '\n');
    }
  } else {
    data.push(leftRight(`Bayar (${paymentMethod})`, formatCurrency(cashReceived || total)) + '\n');
  }
  
  if (paymentMethod === 'CASH' || (splitPayments?.some(p => p.method === 'TUNAI'))) {
    if (change !== undefined && change > 0) {
      data.push(leftRight('Kembali', formatCurrency(change)) + '\n');
    }
  }
  
  // Footer
  data.push(
    line() + '\n',
    '\x1B\x61\x01', // Center
    footerText1 + '\n',
    '\n',
  );
  if (footerText2) {
    data.push(footerText2 + '\n');
  }
  data.push(
    '\n\n\n',
    '\x1D\x56\x00', // Cut paper
  );
  
  await window.qz.print(config, [{ type: 'raw', format: 'plain', data: data.join('') }]);
}

/**
 * Print test page
 */
export async function printTest(printerName: string): Promise<void> {
  await connectQZ();
  
  const config = window.qz.configs.create(printerName);
  const data = [
    '\x1B\x40', // Initialize
    '\x1B\x61\x01', // Center
    '\x1B\x21\x30', // Double height+width
    'TEST PRINT\n',
    '\x1B\x21\x00', // Normal
    '\n',
    'QZ Tray Connected!\n',
    'Printer: ' + printerName + '\n',
    '\n',
    new Date().toLocaleString('id-ID') + '\n',
    '\n\n\n',
    '\x1D\x56\x00', // Cut
  ];
  
  await window.qz.print(config, [{ type: 'raw', format: 'plain', data: data.join('') }]);
}

/**
 * Open cash drawer
 */
export async function openCashDrawer(printerName: string): Promise<void> {
  await connectQZ();
  
  const config = window.qz.configs.create(printerName);
  // Standard cash drawer kick command
  const data = '\x1B\x70\x00\x19\xFA';
  
  await window.qz.print(config, [{ type: 'raw', format: 'plain', data }]);
}

/**
 * Check if QZ Tray is available
 */
export async function isQZAvailable(): Promise<boolean> {
  try {
    await connectQZ();
    return true;
  } catch {
    return false;
  }
}
