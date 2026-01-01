# MiniChannel Frontend

Modern web dashboard for MiniChannel - Multi-tenant Point of Sale and inventory management system with real-time updates.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.1-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

## Features

- 💼 **Multi-tenant Dashboard** - Each store with independent branding
- 🎨 **Dark/Light Theme** - System-wide theme toggle
- ⚡ **Real-time Updates** - Socket.io integration for live data
- 📱 **Responsive Design** - Mobile-first approach
- 🖨️ **Thermal Printer Support** - Customizable receipt templates
- 📊 **Analytics Dashboard** - Sales, inventory, and performance metrics
- 🔍 **Advanced Search** - Product, transaction, and customer search
- 🌐 **Marketplace Integration** - Tokopedia, Shopee management
- 🧾 **POS Interface** - Fast checkout with split payment support
- 🔐 **Role-based Access** - Owner, Manager, Kasir permissions

## Quick Start

```bash
npm install
npm run dev
```

## Tech Stack

- **Next.js 16** - App Router + Turbopack
- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Tailwind CSS 4** - Styling
- **Socket.io** - Real-time Updates
- **Axios** - HTTP Client
- **Recharts** - Data Visualization

## Project Structure

```
app/
├── login/              # Authentication
├── pos/                # Point of Sale
└── dashboard/
    ├── products/       # Product Management
    ├── categories/     # Category Management
    ├── stock/          # Stock Overview & Alerts
    ├── transactions/   # Transaction History
    ├── returns/        # Return & Refund
    ├── reports/        # Sales Analytics
    ├── branches/       # Branch Management
    └── settings/       # System Settings

components/             # Reusable UI Components
lib/                    # Utilities & API Client
hooks/                  # Custom React Hooks
contexts/               # React Context Providers
```

## Routes

### Public

| Route | Description |
|-------|-------------|
| `/login` | Authentication |

### Protected

| Route | Access | Description |
|-------|--------|-------------|
| `/pos` | All Roles | Point of Sale Interface |
| `/dashboard` | All Roles | Dashboard Overview |
| `/dashboard/products` | Manager+ | Product Management |
| `/dashboard/categories` | Manager+ | Category Management |
| `/dashboard/stock` | All Roles | Stock Overview |
| `/dashboard/transactions` | All Roles | Transaction History |
| `/dashboard/returns` | Manager+ | Return Management |
| `/dashboard/reports` | Manager+ | Sales Reports |
| `/dashboard/branches` | Owner | Branch Management |
| `/dashboard/settings` | Manager+ | System Settings |

## Features

### Point of Sale

- Product search with smart filtering
- Cart management with quantity adjustment
- Multiple payment methods (Cash, Transfer, QRIS, Debit)
- Split payment support
- Thermal receipt printing via QZ Tray

### Product Management

- Card-based product listing
- Single and multi-variant products
- SKU/Barcode support
- Bulk operations (delete, import/export)
- Stock per branch visibility

### Stock Management

- Multi-branch stock overview
- Stock adjustment with history logging
- Low stock alerts with threshold settings
- Real-time updates via WebSocket

### Transaction & Reports

- Transaction history with filters
- Sales analytics and charts
- Top products by revenue
- Branch performance comparison

## Development

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint
```

## License

MIT
