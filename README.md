# MiniChannel Frontend

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.1-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

Web Dashboard untuk MiniChannel - Omnichannel POS System.

## Features

- Point of Sale dengan smart search
- Multi-cabang stock management
- Real-time updates (Socket.io)
- Excel import/export produk
- Stock alerts per variant
- Split payment support
- Thermal printer integration
- Dark/Light theme

## Quick Start

```bash
npm install
npm run dev
```

Server: http://localhost:3100

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | React framework (App Router + Turbopack) |
| React | 19.2.1 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Styling |
| Socket.io | 4.7 | Real-time updates |
| Recharts | 3.5 | Charts |
| Axios | - | HTTP client |

## Project Structure

```
app/
├── login/              # Authentication
├── pos/                # Point of Sale
└── dashboard/
    ├── products/       # Product management
    ├── stock/          # Stock & alerts
    ├── transactions/   # Transaction history
    ├── reports/        # Sales analytics
    └── settings/       # System settings

components/             # Reusable UI
lib/                    # API client & utils
hooks/                  # Custom hooks
contexts/               # React contexts
```

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Authentication |
| `/pos` | All | Point of Sale |
| `/dashboard` | All | Overview |
| `/dashboard/products` | Manager+ | Products |
| `/dashboard/stock` | All | Stock & alerts |
| `/dashboard/transactions` | All | Transactions |
| `/dashboard/reports` | Manager+ | Reports |
| `/dashboard/settings` | Manager+ | Settings |

## Build & Deploy

```bash
# Build
npm run build

# Vercel
vercel --prod
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-api.com/api
```
