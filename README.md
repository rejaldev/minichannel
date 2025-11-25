# Aneka Buana - Frontend Dashboard

Dashboard browser untuk manajemen toko Aneka Buana (Next.js 15 + TypeScript + Tailwind CSS).

## Quick Start

```bash
npm install
npm run dev
```

**URL:** http://localhost:3000

## Features

### Pages
- **Dashboard** (`/dashboard`) - Overview transaksi, revenue, low stock alerts
- **Products** (`/dashboard/products`) - CRUD produk dengan varian & **per-cabang pricing**
  - Product list: Multi-column table showing stock & price per cabang
  - New/Edit product: Per-cabang input for price & stock
  - Support SINGLE (produk tunggal) & VARIANT (dengan varian)
  - Bulk apply: Set price/stock to all cabangs at once
  - Validation: At least one cabang must have price
  - Mobile: Card view with per-cabang breakdown
- **Transactions** (`/dashboard/transactions`) - Riwayat transaksi dengan filter
- **Reports** (`/dashboard/reports`) - Summary revenue & payment methods
- **Users** (`/dashboard/users`) - User management dengan role (OWNER, MANAGER, KASIR)
- **Categories** (`/dashboard/categories`) - Manajemen kategori produk
- **Settings** (`/dashboard/settings`) - Pengaturan sistem

### Settings Page
**Path:** `/dashboard/settings`

**5 Tabs:**
1. **General** - Nama toko, contact info, timezone
2. **Stock** - Min stock threshold global
3. **Cabang** - CRUD branches dengan stats (users, stocks, transactions)
   - Add/edit cabang with name, address, phone
   - Toggle active/inactive status
   - View stats per cabang
   - Card-based grid layout
4. **Printer** - Centralized printer configuration:
   - Auto Print toggle
   - Printer name (optional)
   - Paper width (58mm/80mm) with live preview
   - Print copies (1-5)
   - Receipt header customization (store name, branch, address, phone)
   - Receipt footer customization (2 lines)
   - Live receipt preview with dynamic width
5. **Backup & Data** - Auto backup, export, danger zone

**Features:**
- Fully mobile responsive
- Real-time preview as you type
- Saves to backend API
- Desktop POS fetches these settings

### Authentication
- JWT-based authentication with localStorage
- Protected routes with redirect to login
- Role-based access control (OWNER, MANAGER, KASIR)

### Responsive Design
- Mobile-first approach
- Breakpoints: mobile (<768px), tablet (≥768px), desktop (≥1024px)
- All pages responsive including Settings

## Project Structure

```
frontend/
├── app/
│   ├── dashboard/          # Dashboard pages
│   │   ├── page.tsx        # Dashboard overview
│   │   ├── products/       # Product management
│   │   ├── transactions/   # Transaction history
│   │   ├── reports/        # Reports & analytics
│   │   ├── users/          # User management
│   │   ├── categories/     # Category management
│   │   └── settings/       # Printer settings
│   ├── login/              # Login page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/             # Reusable components
│   └── ProtectedRoute.tsx  # Auth guard
├── contexts/               # React contexts
│   └── ThemeContext.tsx    # Theme provider
├── lib/                    # Utilities
│   ├── api.ts              # API client functions
│   └── auth.ts             # Auth utilities
└── public/                 # Static assets
```

## API Integration

### Backend API
**Base URL:** http://localhost:5000

### API Endpoints Used
- `POST /api/auth/login` - User login
- `GET /api/auth/users` - Get all users
- `GET /api/products` - Get products with filters
- `GET /api/transactions` - Get transactions
- `GET /api/transactions/summary` - Get summary
- `GET /api/settings/printer?cabangId=xxx` - Get printer settings
- `PUT /api/settings/printer` - Update printer settings

### Example API Call
```typescript
// lib/api.ts
export const settingsAPI = {
  getPrinterSettings: (cabangId: string) => 
    fetch(`${API_URL}/settings/printer?cabangId=${cabangId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
  
  updatePrinterSettings: (data: PrinterSettings) =>
    fetch(`${API_URL}/settings/printer`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
};
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios (lib/api.ts)
- **Authentication:** JWT with localStorage
- **State Management:** React Hooks (useState, useEffect, useContext)

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server (port 3000)

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Mobile Responsive Examples

```tsx
// Padding responsive
<div className="px-4 md:px-6 lg:px-8">

// Text size responsive
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Button width responsive
<button className="w-full md:w-auto">
```

## Recent Updates

### v1.4.0 (Nov 26, 2025) - Per-Cabang Pricing
- **Multi-Column Product Table**: Show stock & price per cabang in table
  - Multi-row header: cabang names with stock/price sub-headers
  - Color-coded stock badges (red/yellow/green)
  - Border separation between cabang columns
  - React.Fragment with proper keys to fix warnings
- **Per-Cabang Pricing UI**:
  - New product page: per-cabang input for SINGLE & VARIANT
  - Edit product page: per-cabang grid for each variant
  - Bulk apply: Set price/stock to all cabangs
  - Validation: At least 1 cabang must have price
- **Mobile Card View**: Per-cabang breakdown in product cards
  - "Total" stock badge at top
  - List of cabangs with individual stock & price
  - Color-coded badges per cabang
- **Cabang Management**: Settings → Cabang tab
  - CRUD operations with stats
  - Active/inactive toggle
  - Card-based grid layout (2 columns)
  - Shows users/stocks/transactions count
- **Bug Fixes**: 
  - Fixed React key props warnings
  - Fixed hydration error from table whitespace
  - Fixed TypeScript errors in variant builder

### v1.2.1 (Nov 15, 2025)
- Removed unused Electron dependencies (escpos, electron, electron-builder, concurrently, wait-on)
- Removed unused files (lib/desktop-api.ts, lib/platform.ts, types/electron.d.ts)
- Simplified login logic (removed Electron detection)
- Updated package.json to web-only dependencies
- Package size reduced by ~40%

### v1.1.0 (Nov 13, 2025)
- Added centralized printer settings page
- Live receipt preview with customizable header/footer
- API integration for settings persistence
- Mobile responsive settings page

### v1.0.0
- All dashboard pages mobile responsive
- User management with roles
- Product management with variants
- Transaction history with filters
- Reports & analytics

## Deployment

### Vercel (Recommended)
```bash
# Push to GitHub
git push origin main

# Deploy via Vercel dashboard or CLI
vercel --prod
```

### Environment Variables on Vercel
Add in Vercel dashboard:
- `NEXT_PUBLIC_API_URL` - Your backend API URL

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

---

**Last Updated:** November 15, 2025  
**Version:** 1.2.1  
**Port:** 3000
