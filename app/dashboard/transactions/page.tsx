'use client';

import { useEffect, useState } from 'react';
import { transactionsAPI, channelsAPI, cabangAPI } from '@/lib/api';
import { getAuth } from '@/lib/auth';
import { Search, Store, ShoppingBag, Globe, Package, X, Eye, RefreshCw, ShoppingCart, Filter } from 'lucide-react';

interface Channel {
  id: string;
  code: string;
  name: string;
  type: string;
  color: string | null;
}

interface Transaction {
  id: string;
  transactionNo: string;
  status: string;
  cabang: { id: string; name: string };
  kasir?: { id: string; name: string };
  channel?: Channel;
  customerName?: string;
  buyerUsername?: string;
  total: number;
  shippingCost: number;
  externalOrderId?: string;
  paymentMethod?: string;
  items: any[];
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string }> = {
  PENDING: { label: 'Menunggu', bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  ONPROCESS: { label: 'Diproses', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  SHIPPED: { label: 'Dikirim', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  COMPLETED: { label: 'Selesai', bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  CANCELLED: { label: 'Dibatalkan', bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

const CHANNEL_ICONS: Record<string, any> = {
  POS: Store, MARKETPLACE: ShoppingBag, WEBSITE: Globe, SOCIAL: Package, OTHER: Package,
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    channelsAPI.getChannels().then(res => setChannels(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate, selectedChannel, selectedStatus, search]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionsAPI.getTransactions({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        channelId: selectedChannel || undefined,
        status: selectedStatus || undefined,
        search: search || undefined,
      });
      setTransactions(res.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (ch?: Channel) => CHANNEL_ICONS[ch?.type || 'POS'] || Store;
  const getColor = (ch?: Channel) => ch?.color || '#3B82F6';

  return (
    <div className="px-4 md:px-6 pb-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <a href="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition">Dashboard</a>
        <span>›</span>
        <span className="text-gray-900 dark:text-white font-medium">Transaksi</span>
      </nav>

      {/* Channel Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedChannel('')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg ${!selectedChannel ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
          Semua
        </button>
        {channels.map((ch) => {
          const Icon = getIcon(ch);
          return (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(selectedChannel === ch.id ? '' : ch.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg ${selectedChannel === ch.id ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              style={{ backgroundColor: selectedChannel === ch.id ? getColor(ch) : undefined }}
            >
              <Icon className="w-4 h-4" /> {ch.name}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari invoice atau pelanggan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">Semua Status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12"><RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin" /></div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Tidak ada transaksi</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Channel</th>
                  <th className="px-4 py-3 text-left font-medium">Invoice</th>
                  <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                  <th className="px-4 py-3 text-left font-medium">Pelanggan</th>
                  <th className="px-4 py-3 text-left font-medium">Total</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((tx) => {
                  const Icon = getIcon(tx.channel);
                  const st = STATUS_CONFIG[tx.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded" style={{ backgroundColor: `${getColor(tx.channel)}20` }}>
                            <Icon className="w-4 h-4" style={{ color: getColor(tx.channel) }} />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{tx.channel?.name || 'POS'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-900 dark:text-white">{tx.transactionNo}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{tx.customerName || tx.buyerUsername || '-'}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Rp {tx.total.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${st.bg}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelectedTx(tx)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Detail Transaksi</h2>
              <button onClick={() => setSelectedTx(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Invoice:</span><p className="font-mono font-semibold text-gray-900 dark:text-white">{selectedTx.transactionNo}</p></div>
                <div><span className="text-gray-500">Channel:</span><p className="font-semibold text-gray-900 dark:text-white">{selectedTx.channel?.name || 'POS'}</p></div>
                <div><span className="text-gray-500">Tanggal:</span><p className="font-semibold text-gray-900 dark:text-white">{new Date(selectedTx.createdAt).toLocaleString('id-ID')}</p></div>
                <div><span className="text-gray-500">Status:</span><span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_CONFIG[selectedTx.status]?.bg}`}>{STATUS_CONFIG[selectedTx.status]?.label}</span></div>
                <div><span className="text-gray-500">Pelanggan:</span><p className="font-semibold text-gray-900 dark:text-white">{selectedTx.customerName || selectedTx.buyerUsername || '-'}</p></div>
                <div><span className="text-gray-500">Cabang:</span><p className="font-semibold text-gray-900 dark:text-white">{selectedTx.cabang?.name}</p></div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedTx.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm">
                      <div><p className="font-medium text-gray-900 dark:text-white">{item.productName}</p><p className="text-xs text-gray-500">{item.variantInfo}</p></div>
                      <div className="text-right"><p className="text-gray-500">{item.quantity} x Rp {item.price.toLocaleString()}</p><p className="font-semibold text-gray-900 dark:text-white">Rp {item.subtotal.toLocaleString()}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-3 text-sm">
                <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-blue-600">Rp {selectedTx.total.toLocaleString('id-ID')}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
