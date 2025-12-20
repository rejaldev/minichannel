'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, ArrowRightLeft } from 'lucide-react';

export default function StockLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Stock Opname',
      path: '/dashboard/stock/opname',
      icon: Package,
      description: 'Audit & penyesuaian stok'
    },
    {
      name: 'Transfer Stock',
      path: '/dashboard/stock/transfers',
      icon: ArrowRightLeft,
      description: 'Transfer antar cabang'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manajemen Stok</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kelola stock opname dan transfer antar cabang
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  group inline-flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                  ${isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
