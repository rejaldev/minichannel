'use client';

import { useState, useEffect } from 'react';
import { cabangAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Cabang {
  id: number;
  name: string;
  address: string;
  phone?: string;
  isActive: boolean;
  _count?: {
    users: number;
    stocks: number;
    transactions: number;
  };
}

function BranchesContent() {
  const [cabangs, setCabangs] = useState<Cabang[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCabang, setEditingCabang] = useState<Cabang | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    fetchCabangs();
  }, []);

  const fetchCabangs = async () => {
    try {
      setLoading(true);
      const response = await cabangAPI.getCabangs();
      setCabangs(response.data);
    } catch (error) {
      console.error('Error fetching cabangs:', error);
      alert('Gagal memuat data cabang');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cabang?: Cabang) => {
    if (cabang) {
      setEditingCabang(cabang);
      setFormData({
        name: cabang.name,
        address: cabang.address || '',
        phone: cabang.phone || ''
      });
    } else {
      setEditingCabang(null);
      setFormData({ name: '', address: '', phone: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCabang(null);
    setFormData({ name: '', address: '', phone: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address) {
      alert('Nama dan alamat wajib diisi!');
      return;
    }

    try {
      if (editingCabang) {
        await cabangAPI.updateCabang(editingCabang.id.toString(), formData);
        alert('Cabang berhasil diupdate!');
      } else {
        await cabangAPI.createCabang(formData);
        alert('Cabang berhasil ditambahkan!');
      }
      handleCloseModal();
      fetchCabangs();
    } catch (error: any) {
      console.error('Error saving cabang:', error);
      alert(error.response?.data?.error || 'Gagal menyimpan cabang');
    }
  };

  const handleToggleActive = async (cabang: Cabang) => {
    if (!confirm(`${cabang.isActive ? 'Nonaktifkan' : 'Aktifkan'} cabang ${cabang.name}?`)) {
      return;
    }

    try {
      await cabangAPI.updateCabang(cabang.id.toString(), { isActive: !cabang.isActive });
      alert('Status cabang berhasil diubah!');
      fetchCabangs();
    } catch (error) {
      console.error('Error toggling cabang status:', error);
      alert('Gagal mengubah status cabang');
    }
  };

  const handleDelete = async (cabang: Cabang) => {
    if (!confirm(`Yakin ingin menghapus cabang ${cabang.name}?`)) return;
    
    try {
      await cabangAPI.deleteCabang(cabang.id.toString());
      alert('Cabang berhasil dihapus!');
      fetchCabangs();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Gagal menghapus cabang');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Memuat data cabang...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Manajemen Cabang
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola semua cabang toko dan lokasi bisnis Anda
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 md:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-slate-100 dark:bg-slate-900 rounded-xl">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Daftar Cabang</h2>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Total {cabangs.length} cabang terdaftar
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Cabang
              </button>
            </div>
          </div>

          <div className="p-4 md:p-6 lg:p-8">
            {cabangs.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">Belum ada cabang terdaftar</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                  Mulai dengan menambahkan cabang pertama Anda
                </p>
                <button
                  onClick={() => handleOpenModal()}
                  className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm font-medium transition-colors duration-200"
                >
                  Tambah Cabang Pertama
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Cabang
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                        Telepon
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Users
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                        Stocks
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                        Transaksi
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {cabangs.map((cabang) => (
                      <tr 
                        key={cabang.id} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          !cabang.isActive ? 'opacity-60' : ''
                        }`}
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {cabang.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                              {cabang.address}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4 hidden md:table-cell">
                          {cabang.phone ? (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {cabang.phone}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg">
                            {cabang._count?.users || 0}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center hidden sm:table-cell">
                          <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg">
                            {cabang._count?.stocks || 0}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center hidden sm:table-cell">
                          <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg">
                            {cabang._count?.transactions || 0}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {cabang.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs font-medium rounded-full">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-xs font-medium rounded-full">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span>
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(cabang)}
                              className="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleToggleActive(cabang)}
                              className={`p-2 rounded-lg transition-colors ${
                                cabang.isActive
                                  ? 'text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50'
                                  : 'text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/50'
                              }`}
                              title={cabang.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            >
                              {cabang.isActive ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(cabang)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Add/Edit Cabang */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingCabang ? 'Edit Cabang' : 'Tambah Cabang Baru'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Cabang *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Contoh: Cabang Pusat, Cabang Timur"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alamat *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Jl. Contoh No. 123, Kota"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="08123456789"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors duration-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium transition-colors duration-200"
                >
                  {editingCabang ? 'Update' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BranchesPage() {
  return (
    <ProtectedRoute>
      <BranchesContent />
    </ProtectedRoute>
  );
}
