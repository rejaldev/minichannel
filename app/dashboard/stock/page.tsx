'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StockPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to opname by default
    router.replace('/dashboard/stock/opname');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
    </div>
  );
}
