# 🎨 MiniChannel - Frontend Dashboard

Modern web dashboard untuk Point of Sale dan inventory management system. Dibangun dengan Next.js 16 (App Router + Turbopack) untuk performa maksimal dan pengalaman pengguna yang smooth.

[![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.1-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local
NEXT_PUBLIC_API_URL=http://localhost:5100
NEXT_PUBLIC_SOCKET_URL=http://localhost:5100

# Run development server
npm run dev
```

**Access:** [http://localhost:3100](http://localhost:3100)

**Default Login:**
- Username: `owner` / Password: `password123`
- Username: `kasir1` / Password: `password123`

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.7 | React framework dengan App Router & Turbopack |
| **React** | 19.2.1 | UI library dengan React 19 features |
| **TypeScript** | 5.x | Type safety & developer experience |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **Socket.io Client** | 4.7.2 | Real-time communication dengan backend |
| **Axios** | 1.7.9 | HTTP client untuk API calls |
| **Recharts** | 3.5.0 | Data visualization & analytics charts |
| **Lucide React** | 0.555.0 | Modern icon library |
| **Radix UI** | Latest | Accessible UI primitives |
| **React Hook Form** | 7.x | Form state management |

## 📱 Application Structure

```
frontend/
├── app/
│   ├── login/                    # Authentication page
│   ├── pos/                      # Point of Sale interface
│   │   └── page.tsx             # POS main page with cart & search
│   └── dashboard/               # Protected dashboard routes
│       ├── page.tsx             # Dashboard overview & analytics
│       ├── layout.tsx           # Dashboard layout with sidebar
│       ├── products/            # Product management
│       │   ├── page.tsx         # Product list (card view)
│       │   ├── new/             # Create product form
│       │   └── [id]/
│       │       ├── page.tsx     # Product detail view
│       │       └── edit/        # Edit product form
│       ├── categories/          # Category management
│       ├── stock/               # Stock management
│       │   ├── page.tsx         # Stock overview with alerts
│       │   └── transfers/       # Inter-branch transfers
│       ├── transactions/        # Transaction history
│       ├── returns/             # Return & refund management
│       ├── reports/             # Sales analytics & reports
│       ├── branches/            # Branch management (OWNER only)
│       └── settings/            # System settings
│           └── page.tsx         # 4 tabs: General, Users, Printer, Backup
├── components/
│   ├── ui/                      # Reusable UI components
│   ├── ProtectedRoute.tsx       # Auth guard component
│   ├── DynamicVariantBuilder.tsx # Product variant builder
│   └── TransactionHistory.tsx   # Transaction list component
├── lib/
│   ├── api.ts                   # Axios API client with interceptors
│   ├── auth.ts                  # Auth utilities & token management
│   ├── socket.ts                # Socket.io client setup
│   └── qz-print.ts             # QZ Tray printer integration
├── hooks/
│   ├── useSocket.ts             # Real-time data sync hook
│   └── useProductSocket.ts      # Product-specific socket hook
└── contexts/
    └── ThemeContext.tsx         # Dark mode theme provider
```

## 🗺 Routes & Access Control

### Public Routes
| Route | Description |
|-------|-------------|
| `/login` | Authentication page dengan username/password |

### Protected Routes

#### 👁️ All Roles (OWNER, MANAGER, ADMIN, KASIR)
| Route | Description | Features |
|-------|-------------|----------|
| `/dashboard` | Dashboard overview | Sales stats, charts, recent transactions |
| `/dashboard/transactions` | Transaction history | Filter, search, detail view |
| `/dashboard/stock` | Stock overview | Multi-cabang view, expandable variants |

#### 💼 KASIR, MANAGER, OWNER
| Route | Description | Features |
|-------|-------------|----------|
| `/pos` | Point of Sale | Product search, cart, payment, print receipt |

#### 🔧 MANAGER, OWNER
| Route | Description | Features |
|-------|-------------|----------|
| `/dashboard/products` | Product management | Card view, bulk delete, import/export |
| `/dashboard/products/new` | Create product | Single/Multi-variant support |
| `/dashboard/products/[id]` | Product detail | View variants, stock per cabang |
| `/dashboard/products/[id]/edit` | Edit product | Update details, variants, pricing |
| `/dashboard/categories` | Category management | CRUD operations |
| `/dashboard/returns` | Return & refund | Process returns, refund payments |
| `/dashboard/reports` | Sales analytics | Charts, top products, trends |
| `/dashboard/settings` | System settings | General, Users, Printer, Backup |

#### 👑 OWNER Only
| Route | Description | Features |
|-------|-------------|----------|
| `/dashboard/branches` | Branch management | Create, edit, activate/deactivate |
| `/dashboard/settings` (Users tab) | User management | Create, edit, delete users |

## 🎯 Key Features

### 🛒 Point of Sale (`/pos`)

#### Smart Product Search
Sistem pencarian produk yang cerdas dengan algoritma 7-phase filtering:

```typescript
// Example: Search "Baju SD 7"
// Will find: "Baju Sekolah - SD 7"
// Won't find: "Baju Pramuka - Panjang 7" (wrong context)
```

**Search Algorithm Features:**
1. **Multi-keyword Parsing** - Split "Baju SD 7" → ["Baju", "SD", "7"]
2. **Text + Number Recognition** - Detect text keywords vs numeric values
3. **Word Boundary Matching** - `\b7\b` untuk exact match, avoid "17" or "27"
4. **Variant-Level Filtering** - Filter variant yang match dengan number keyword
5. **Pre-Product Keyword Validation** - Product harus punya semua text keywords
6. **Relevance Scoring** - Exact match > Starts with > Contains
7. **Dynamic Threshold** - Ambil produk dengan score 20-40% dari top score

**Relevance Scoring:**
- Exact match di nama produk: +100 points
- Starts with di nama produk: +50 points
- Contains di nama produk: +30 points
- Exact match di variant: +80 points
- Starts with di variant: +40 points
- Contains di variant: +20 points

#### Cart Management
- Add products dengan keyboard shortcuts (F1-F12)
- Adjust quantity langsung dari cart
- Real-time stock validation
- Visual feedback untuk low stock items
- Auto-calculate subtotal & total

#### Payment Methods
- **Cash**: Auto-calculate kembalian
- **Transfer**: Bank transfer / e-wallet
- **QRIS**: QR code payment
- **Debit**: Debit card
- **Split Payment**: Kombinasi 2 metode (e.g., Cash Rp 50.000 + Transfer Rp 50.000)

#### Receipt Printing
- Thermal printer support via QZ Tray
- Paper size: 58mm / 80mm
- Customizable header & footer
- Auto-print atau manual print
- Test print dari settings

### 📦 Product Management (`/dashboard/products`)

#### Card-Based Layout
- Modern card grid view (1-4 columns responsive)
- Product image placeholder dengan initial letter
- Expandable untuk lihat detail
- Hover effects dengan smooth transitions

#### Product Card Shows:
- Checkbox untuk bulk selection
- Active/Inactive status badge
- Product name & category
- Variant count dengan expand button
- Price range (min-max)
- Total stock dengan color coding:
  - 🔴 Red: 0 unit (out of stock)
  - 🟡 Yellow: 1-20 unit (low stock)
  - 🟢 Green: >20 unit (available)
- Action buttons (Detail, Edit)

#### Variant Details Modal
Untuk produk dengan variant, klik tombol varian akan membuka modal yang menampilkan:
- Semua variant dengan nama & SKU
- Stock per cabang untuk setiap variant
- Price per variant
- Color-coded stock badges
- Scrollable content dengan fixed header/footer

#### Bulk Operations
- Select multiple products dengan checkbox
- Bulk delete dengan konfirmasi
- Select all / Deselect all

#### Import/Export
- Import products dari CSV
- Export products ke CSV
- Export transactions ke CSV
- Template download untuk import

### 📊 Stock Management (`/dashboard/stock`)

#### Stock Overview
**Layout:**
- Tabel dengan expandable rows
- Column: Produk, Total Stock, Stock per Cabang, Actions
- Filter: Search, Low Stock Only, Cabang Selector
- Tab navigation: Overview | History

**Features:**
- Multi-cabang stock visibility
- Expand product untuk lihat variant details
- Real-time updates via WebSocket
- Stock alerts dengan visual indicator

#### Stock Alert System
**Set Alert:**
- Klik "Set Alert" di action menu
- Pilih cabang dari dropdown
- Set minimum stock threshold
- Visual badge indicator:
  - 🔴 "LOW" - Stock dibawah threshold (orange)
  - 🔵 "≥X" - Stock diatas threshold (blue)

**Alert Badge Display:**
- Muncul di cell stock (inline dengan quantity)
- Bell icon + threshold value
- Real-time update ketika stock berubah

#### Stock Adjustment
**Bulk Adjustment Modal:**
- Add multiple items to adjustment list
- Each item: Variant, Cabang, Current Stock, New Stock, Reason, Notes
- "Add to List" button untuk menambah item baru
- Submit semua adjustment sekaligus

**Adjustment Reasons:**
- Stok opname
- Barang rusak
- Barang hilang
- Return supplier
- Koreksi input
- Penyesuaian sistem
- Lainnya

**Adjustment History:**
1. **History Tab** - Dedicated tab untuk semua adjustment history
   - Table view dengan kolom: Date, Product, Variant, Cabang, Previous → New, Difference, Reason, User
   - Filter by cabang, variant, date range, reason
   - Pagination dengan "Load More"

2. **Quick History Modal** - Per-variant history
   - Akses dari action menu ("Riwayat Stock")
   - Shows: Adjustment entries dengan timeline
   - Info: Previous qty → New qty, ±difference badge, reason, notes, user, timestamp
   - Badge cabang (untuk single product dengan multiple cabangs)
   - Scrollable modal dengan fixed header/footer

### 💰 Transaction Management

#### Transaction List
- Filter by date range, payment method, kasir
- Search by transaction ID / customer name
- Status badges (COMPLETED, CANCELLED, REFUNDED)
- Quick view transaction details

#### Transaction Detail
- Complete item list dengan quantities
- Payment breakdown (split payment support)
- Customer info (if available)
- Kasir info
- Timestamps (created, completed)
- Print receipt button

### 📈 Reports & Analytics

#### Dashboard Overview
- Today's sales summary
- Sales trend chart (7 days)
- Top products (by revenue)
- Top categories
- Payment method breakdown
- Per-kasir performance

#### Detailed Reports (`/dashboard/reports`)
- Filter by date range
- Export to CSV/PDF
- Charts: Line, Bar, Pie
- Metrics: Revenue, Transactions, Average Order Value

### ⚙️ System Settings (`/dashboard/settings`)

#### 1. General Settings
- Store name & address
- Store phone & email
- Business hours configuration
- Timezone setting

#### 2. User Management (OWNER only)
**User List:**
- Table dengan kolom: Name, Username, Role, Cabang, Status, Actions
- Status toggle: Active / Inactive
- Edit user modal
- Delete user dengan konfirmasi

**Create/Edit User:**
- Form fields: Name, Username, Password, Role, Cabang Assignment, Status
- Role options: OWNER, MANAGER, ADMIN, KASIR
- Cabang dropdown (required untuk non-OWNER)

#### 3. Printer Settings
**Receipt Configuration:**
- Header text (multi-line)
- Footer message
- Paper size: 58mm / 80mm
- Store logo (coming soon)

**Test Print:**
- Preview receipt format
- Test print button
- QZ Tray connection status

#### 4. Backup & Data
**Manual Backup:**
- Backup database to JSON
- Download backup file
- Backup list dengan download links

**Auto Backup:**
- Schedule daily backup (00:00)
- Enable/disable auto backup
- 7-day retention policy (auto-delete old backups)

**Export Data:**
- Export transactions to CSV
- Export products to CSV
- Date range filter
- Download generated file

**Reset Settings:**
- Reset to default configuration
- Confirmation required
- Excludes user data & transactions

## 🔌 API Integration

### API Client (`lib/api.ts`)

```typescript
// Example: Fetch products with search
const products = await productsAPI.getProducts({
  search: 'Baju SD 7',
  categoryId: 'uuid',
  cabangId: 'uuid'
});

// Create stock adjustment
await stockAPI.createAdjustment({
  variantId: 'uuid',
  cabangId: 'uuid',
  previousQty: 10,
  newQty: 15,
  difference: 5,
  reason: 'Stok opname',
  notes: 'Koreksi stok fisik'
});

// Set stock alert
await stockAPI.setAlert({
  variantId: 'uuid',
  cabangId: 'uuid',
  minStock: 5
});
```

### WebSocket Events (`lib/socket.ts`)

```typescript
// Listen to stock updates
socket.on('stock-updated', (data) => {
  console.log('Stock updated:', data);
  // { variantId, cabangId, newQuantity }
  refreshStockData();
});

// Listen to product changes
socket.on('product-updated', (data) => {
  console.log('Product changed:', data);
  // { productId, action: 'create' | 'update' | 'delete' }
  refreshProductList();
});

// Emit real-time refresh
socket.emit('refresh-data', { type: 'products' });
```

## 🎨 UI Components

### Custom Hooks

#### `useSocket()`
```typescript
const { connected, socket } = useSocket();
// Returns socket connection status and instance
```

#### `useProductSocket()`
```typescript
const { products, loading } = useProductSocket();
// Auto-refresh products on real-time updates
```

### Protected Route Component
```typescript
<ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
  <ProductManagementPage />
</ProtectedRoute>
```

## 🚀 Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t minichannel-frontend .
docker run -p 3100:3100 minichannel-frontend
```

### Environment Variables

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:5100
NEXT_PUBLIC_SOCKET_URL=http://localhost:5100

# Optional
NEXT_PUBLIC_APP_NAME=MiniChannel
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - `sm`: 640px
  - `md`: 768px (tablet)
  - `lg`: 1024px (desktop)
  - `xl`: 1280px (large desktop)
  - `2xl`: 1536px (extra large)

## 🎨 Dark Mode

- Auto-detect system preference
- Manual toggle di header
- Persistent state (localStorage)
- Smooth transitions

## ⌨️ Keyboard Shortcuts

### POS
- `F1-F12`: Quick add product to cart
- `Ctrl+F`: Focus search
- `Ctrl+Enter`: Complete transaction
- `Esc`: Cancel current action

### General
- `Ctrl+K`: Open command palette (coming soon)
- `Ctrl+/`: Toggle shortcuts help

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma](https://www.prisma.io/docs)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create feature branch
3. Make changes
4. Submit pull request

## 📄 License

MIT License

---

**Built with ❤️ using Next.js 16 & React 19**
- **Real-time Stock Check**: Live stock validation
- **Thermal Printing**: Auto-print receipt via QZ Tray

### Smart Search Algorithm

**How it works:**
```
Input: "Baju SD 7"
↓
Phase 1: Parse keywords
  - textKeywords: ["baju", "sd"]
  - numberKeywords: ["7"]
↓
Phase 2: Database query (broad search)
  - OR conditions across name, desc, category, variants
↓
Phase 3: Relevance scoring
  - Product name exact: 1000 pts
  - Variant number match: 800 pts
  - Combined text+number: +300 bonus
↓
Phase 4: Threshold filtering
  - maxScore >= 500 → keep 40% of top
  - Remove low-relevance products
↓
Phase 5: Pre-product filter
  - Check ALL text keywords in product+variants
  - "Baju Pramuka" rejected (no "SD")
↓
Phase 6: Variant filtering
  - Word boundary: /\b7\b/i
  - "SD 7" ✅ matches
  - "17" ❌ no match
  - "Panjang 7" in wrong product ❌
↓
Phase 7: Final cleanup
  - Remove products with no variants
↓
Output: Only "Baju Sekolah - SD 7"
```

**Why this matters:**
- ✅ No false positives ("7" won't match "17")
- ✅ Context-aware (must have "SD" + "7" together)
- ✅ Precision over recall (better miss some than show wrong ones)

### Product Management
- **Multi-variant Products**: Size, color, type combinations
- **Dynamic Variant Builder**: Add unlimited variant types
- **SKU Generation**: Auto or manual SKU assignment
- **Category Association**: Organize products by category
- **Bulk Operations**: Import/export via CSV (coming soon)

### Real-time Updates
- WebSocket connection via Socket.io
- Auto-reconnect on disconnect
- Live stock updates across devices
- Transaction notifications
- Product changes broadcast

### Reporting & Analytics
- Daily/weekly/monthly sales reports
- Top products & categories
- Sales trend visualization (Recharts)
- Payment method breakdown
- Per-kasir performance
- Export to PDF/CSV

## 🔧 Configuration

### Environment Variables

Create `.env.local` in frontend root:

```env
# Backend API URL (default from api.ts)
NEXT_PUBLIC_API_URL=http://localhost:5100/api

# For LAN/WiFi access (optional)
# NEXT_PUBLIC_API_URL=http://192.168.1.6:5100/api
```

**Default API URL** (if not set):
- Production: https://anekabuana-api.ziqrishahab.com/api
- Development: Use .env.local to override

### Next.js Config

**next.config.ts:**
```typescript
const config: NextConfig = {
  // Production optimizations
  reactStrictMode: true,
  
  // Turbopack for dev (faster)
  // Auto-enabled with --turbopack flag
}
```

## 🎨 UI Components

### Reusable Components (`/components`)

- `ProtectedRoute.tsx` - Route guard dengan role check
- `DynamicVariantBuilder.tsx` - Multi-variant product builder
- `TransactionHistory.tsx` - Transaction list dengan filtering
- `UnderConstruction.tsx` - Placeholder untuk upcoming features
- `/ui/*` - Radix UI components (Alert, Toast, Dialog)

### Contexts (`/contexts`)

- `ThemeContext.tsx` - Dark/light mode toggle

### Custom Hooks (`/hooks`)

- `useSocket.ts` - WebSocket connection management
- `useProductSocket.ts` - Product-specific real-time updates

### Utilities (`/lib`)

- `api.ts` - Axios instance dengan interceptors & token refresh
- `auth.ts` - Authentication helpers (login, logout, getUser)
- `socket.ts` - Socket.io client setup
- `qz-print.ts` - QZ Tray thermal printing interface

## 🖨 Thermal Printing Setup

1. **Install QZ Tray:**
   - Download: https://qz.io/download
   - Install & run QZ Tray app
   - Add digital certificate (auto-generated)

2. **Configure Printer:**
   - Go to Settings → Printer
   - Test print to verify connection
   - Customize receipt layout (header, footer)

3. **Supported Printers:**
   - Thermal 58mm (small receipts)
   - Thermal 80mm (standard receipts)
   - ESC/POS compatible printers

## 🚀 Deployment

### Development
```bash
npm run dev
# Access: http://localhost:3100
```

### Production Build
```bash
npm run build
npm start
```

### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start npm --name "minichannel-frontend" -- start

# Auto-restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

**Environment Variables di Vercel:**
- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., https://your-api.com/api)

## 🐛 Troubleshooting

### Common Issues

**1. "Cannot connect to backend"**
```bash
# Check backend is running
curl http://localhost:5100/health

# Verify API URL
echo $NEXT_PUBLIC_API_URL
```

**2. "Socket connection failed"**
- Check CORS settings di backend
- Verify Socket.io version compatibility (4.7.2 ↔ 4.8.1)
- Check firewall/antivirus blocking WebSocket

**3. "QZ Tray not responding"**
- Launch QZ Tray application
- Check certificate is trusted in browser
- Verify printer is connected & online

**4. "Build errors"**
```bash
# Clear cache & reinstall
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

**5. "Search not working properly"**
- Check backend logs for search errors
- Verify product has variants
- Test with simple keyword first (e.g., "Baju")

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global Tailwind styles
│   ├── layout.tsx         # Root layout (theme provider)
│   ├── page.tsx           # Homepage (redirects to /login)
│   ├── login/             # Authentication
│   │   └── page.tsx
│   ├── pos/               # Point of Sale
│   │   └── page.tsx
│   └── dashboard/         # Protected dashboard
│       ├── layout.tsx     # Dashboard layout + sidebar
│       ├── page.tsx       # Dashboard home (stats)
│       ├── products/      # Product CRUD
│       ├── transactions/  # Transaction history
│       ├── reports/       # Sales analytics
│       ├── returns/       # Return & refund
│       ├── stock/         # Stock overview
│       ├── stock-opname/  # Stock audit (coming soon)
│       ├── stock-transfers/ # Branch transfers (coming soon)
│       ├── branches/      # Branch management
│       ├── categories/    # Category CRUD
│       ├── users/         # User management
│       └── settings/      # System settings (4 tabs)
│           ├── page.tsx   # General settings
│           ├── users/     # User management
│           ├── printer/   # Printer config
│           └── backup/    # Backup & export
│
├── components/            # Reusable React components
│   ├── DynamicVariantBuilder.tsx  # Multi-variant builder
│   ├── ProtectedRoute.tsx         # Auth guard
│   ├── TransactionHistory.tsx     # Transaction list
│   ├── UnderConstruction.tsx      # Placeholder
│   └── ui/                        # Radix UI primitives
│       ├── alert-dialog.tsx
│       ├── button.tsx
│       ├── input.tsx
│       └── toast.tsx
│
├── contexts/              # React Context API
│   └── ThemeContext.tsx   # Dark/light mode
│
├── hooks/                 # Custom React hooks
│   ├── useSocket.ts       # Socket.io connection
│   └── useProductSocket.ts # Product real-time updates
│
├── lib/                   # Utility libraries
│   ├── api.ts            # Axios client (auth, products, transactions, etc)
│   ├── auth.ts           # Auth helpers (login, logout, getUser)
│   ├── socket.ts         # Socket.io client setup
│   └── qz-print.ts       # QZ Tray thermal printing
│
├── public/                # Static assets
│   └── icon-readme.txt
│
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS config
├── tsconfig.json          # TypeScript config
└── package.json           # Dependencies & scripts
```

## 🔗 Related Repositories

- **Backend API**: https://github.com/rejaldev/anekabuana-api
- **Main Project**: https://github.com/rejaldev/minichannel (private monorepo)

## 🤝 Contributing

This is a private project. For bug reports or feature requests:
- Open an issue: https://github.com/rejaldev/anekabuana/issues
- Submit a PR with detailed description

## 📝 License

© 2025 MiniChannel. All rights reserved.

---

**Built with ❤️ using Next.js 16 + Turbopack**
