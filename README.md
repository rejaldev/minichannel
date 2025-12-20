# 🎨 MiniChannel - Frontend Dashboard

Modern web dashboard untuk Point of Sale dan inventory management system. Built with Next.js 16 (App Router + Turbopack) untuk maximum performance.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

**Access:** http://localhost:3100

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.7 | React framework dengan App Router & Turbopack |
| **React** | 19.2.1 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first CSS |
| **Socket.io Client** | 4.7.2 | Real-time communication |
| **Axios** | 1.13.2 | HTTP client |
| **Recharts** | 3.5.0 | Data visualization |
| **Lucide React** | 0.555.0 | Icon library |
| **Radix UI** | Latest | Accessible UI components |

## 📱 Pages & Routes

### Public Routes
- `/login` - Authentication page

### Protected Routes (Dashboard)

| Route | Description | Access |
|-------|-------------|--------|
| `/dashboard` | Overview & statistics | All roles |
| `/pos` | Point of Sale interface | KASIR, MANAGER, OWNER |
| `/dashboard/products` | Product management (CRUD) | MANAGER, OWNER |
| `/dashboard/products/new` | Create new product | MANAGER, OWNER |
| `/dashboard/products/[id]/edit` | Edit product details | MANAGER, OWNER |
| `/dashboard/categories` | Category management | MANAGER, OWNER |
| `/dashboard/transactions` | Transaction history | All roles |
| `/dashboard/reports` | Sales analytics | OWNER, MANAGER |
| `/dashboard/stock` | Stock overview | All roles |
| `/dashboard/stock-opname` | Stock audit (Coming Soon) | MANAGER, OWNER |
| `/dashboard/stock-transfers` | Inter-branch transfers (Coming Soon) | MANAGER, OWNER |
| `/dashboard/returns` | Return & refund management | MANAGER, OWNER |
| `/dashboard/branches` | Branch management | OWNER |
| `/dashboard/users` | User management | OWNER |
| `/dashboard/settings` | System configuration | OWNER, MANAGER |

## ⚙️ Settings Module

Dashboard settings terbagi dalam 4 tabs:

### 1. General Settings
- Store name & information
- Business hours
- Timezone configuration

### 2. User Management
- Create, edit, delete users
- Role assignment (OWNER, MANAGER, ADMIN, KASIR)
- User status (active/inactive)
- Password management

### 3. Printer Settings
- Receipt customization
- Header text & logo
- Footer message
- Paper size (58mm/80mm)
- Test print functionality

### 4. Backup & Data
- **Manual Backup**: Backup database on-demand (JSON format)
- **Auto Backup**: Schedule daily backup at 00:00
- **Export Data**: 
  - Transactions to CSV
  - Products to CSV
  - Reports to PDF
- **Reset Settings**: Restore default configuration
- **Retention**: 7-day auto-cleanup for old backups

## 🎯 Key Features

### POS Interface (`/pos`)
- **Fast Product Search**: 
  - Smart keyword matching dengan relevance scoring
  - Multi-keyword parsing (text + numbers)
  - Variant filtering (e.g., "Baju SD 7" shows only SD 7)
  - Word boundary matching (\b7\b) untuk avoid false positives
  - Dynamic threshold filtering
- **Keyboard Shortcuts**: F1-F12 for quick actions
- **Cart Management**: Add, remove, adjust quantities
- **Payment Methods**: Cash, Transfer, QRIS, Debit
- **Split Payment**: Support multiple payment methods
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
