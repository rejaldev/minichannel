# Aneka Buana - Frontend Dashboard

Dashboard browser untuk manajemen toko Aneka Buana (Next.js 15 + TypeScript + Tailwind CSS).

## 🚀 Quick Start

```bash
npm install
npm run dev
```

**URL:** http://localhost:3000

## 🌟 Features

### Pages
- **Dashboard** (`/dashboard`) - Overview transaksi, revenue, low stock alerts
- **Products** (`/dashboard/products`) - CRUD produk dengan varian & multi-branch stock
- **Transactions** (`/dashboard/transactions`) - Riwayat transaksi dengan filter
- **Reports** (`/dashboard/reports`) - Summary revenue & payment methods
- **Users** (`/dashboard/users`) - User management dengan role (OWNER, MANAGER, KASIR)
- **Categories** (`/dashboard/categories`) - Manajemen kategori produk
- **Settings** (`/dashboard/settings`) - ⭐ **NEW** Printer settings dengan live preview

### Settings Page (New!)
**Path:** `/dashboard/settings`

**3 Tabs:**
1. **General** - Theme, language, currency
2. **Printer** - Centralized printer configuration:
   - Auto Print toggle
   - Printer name (optional)
   - Paper width (58mm/80mm) with live preview
   - Print copies (1-5)
   - Receipt header customization (store name, branch, address, phone)
   - Receipt footer customization (2 lines)
   - Live receipt preview with dynamic width
3. **Backup & Data** - Auto backup, export, danger zone

**Features:**
- ✅ Fully mobile responsive
- ✅ Real-time preview as you type
- ✅ Saves to backend API (`/api/settings/printer`)
- ✅ Desktop POS fetches these settings

### Authentication
- JWT-based authentication with localStorage
- Protected routes with redirect to login
- Role-based access control (OWNER, MANAGER, KASIR)

### Responsive Design
- ✅ Mobile-first approach
- ✅ Breakpoints: mobile (<768px), tablet (≥768px), desktop (≥1024px)
- ✅ All pages responsive including Settings

## 📁 Project Structure

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
│   │   └── settings/       # ⭐ NEW - Printer settings
│   ├── login/              # Login page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/             # Reusable components
│   └── ProtectedRoute.tsx  # Auth guard
├── contexts/               # React contexts
│   └── ThemeContext.tsx    # Theme provider
├── lib/                    # Utilities
│   ├── api.ts              # API client functions
│   ├── auth.ts             # Auth utilities
│   └── platform.ts         # Platform detection
└── public/                 # Static assets
```

## 🔌 API Integration

### Backend API
**Base URL:** http://localhost:5000

### API Endpoints Used
- `POST /api/auth/login` - User login
- `GET /api/auth/users` - Get all users
- `GET /api/products` - Get products with filters
- `GET /api/transactions` - Get transactions
- `GET /api/transactions/summary` - Get summary
- `GET /api/settings/printer?cabangId=xxx` - ⭐ NEW Get printer settings
- `PUT /api/settings/printer` - ⭐ NEW Update printer settings

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

## 🎨 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP Client:** Fetch API
- **Authentication:** JWT with localStorage
- **State Management:** React Hooks (useState, useEffect, useContext)

## 📝 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start dev server (port 3000)

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 📱 Mobile Responsive Examples

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

## 🔄 Recent Updates

### v1.1.0 (Nov 13, 2025)
- ✅ Added centralized printer settings page
- ✅ Live receipt preview with customizable header/footer
- ✅ API integration for settings persistence
- ✅ Mobile responsive settings page

### v1.0.0
- ✅ All dashboard pages mobile responsive
- ✅ User management with roles
- ✅ Product management with variants
- ✅ Transaction history with filters
- ✅ Reports & analytics

## 🚀 Deployment

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

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Lucide Icons](https://lucide.dev)

---

**Last Updated:** November 13, 2025  
**Version:** 1.1.0  
**Port:** 3000
