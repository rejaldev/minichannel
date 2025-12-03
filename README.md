# Aneka Buana - Frontend Dashboard

Dashboard web untuk manajemen toko Aneka Buana.

## Quick Start

```bash
npm install
npm run dev
```

**URL:** http://localhost:3000

## Tech Stack

- Next.js 16 + TypeScript
- Tailwind CSS 4
- Recharts (visualisasi data)

## Pages

| Path | Description |
|------|-------------|
| `/login` | Login page |
| `/dashboard` | Overview & statistics |
| `/dashboard/products` | Product management (CRUD) |
| `/dashboard/transactions` | Transaction history |
| `/dashboard/reports` | Revenue reports |
| `/dashboard/users` | User management |
| `/dashboard/categories` | Category management |
| `/dashboard/settings` | System settings |

## Settings Tabs

1. **General** - Store info, timezone
2. **Stock** - Min stock threshold
3. **Cabang** - Branch management (CRUD)
4. **Printer** - Receipt customization (header, footer)
5. **Backup** - Export data

## Features

- Dark mode support
- Mobile responsive
- Real-time dashboard statistics
- Per-branch pricing & stock
- Screen options (show/hide widgets)

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Scripts

```bash
npm run dev    # Development (Turbopack)
npm run build  # Production build
npm run start  # Start production
```

---
**Port:** 3000
