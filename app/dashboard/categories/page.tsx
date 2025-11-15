'use client';

import { useEffect, useState } from 'react';
import { productsAPI } from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await productsAPI.getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        // Update - belum ada API endpoint
        alert('Fitur edit kategori akan segera hadir!');
      } else {
        // Create
        await productsAPI.createCategory(formData);
        alert('Kategori berhasil ditambahkan!');
        fetchCategories();
        handleCloseModal();
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Gagal menyimpan kategori');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus kategori "${name}"?`)) return;
    
    try {
      // Delete - belum ada API endpoint
      alert('Fitur hapus kategori akan segera hadir!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Gagal menghapus kategori');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-6">
      {/* Breadcrumb + Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <a href="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition">
            Home
          </a>
          <span>›</span>
          <span className="font-semibold text-gray-900 dark:text-white">Kategori Produk</span>
        </nav>
        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all whitespace-nowrap"
        >
          + Tambah Kategori
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white truncate">{category.name}</h3>
                {category.description && (
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{category.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 md:gap-2 ml-2">
                <button
                  onClick={() => handleOpenModal(category)}
                  className="p-1.5 md:p-2 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900/30 rounded-lg transition-colors"
                  title="Edit"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Hapus"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Produk</span>
                <span className="text-xl md:text-2xl font-bold text-slate-600 dark:text-slate-400">
                  {category._count?.products || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8 md:py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-400 dark:text-gray-600 mb-3 md:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2">Belum ada kategori</h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-3 md:mb-4">Mulai dengan menambahkan kategori pertama Anda</p>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 md:px-6 py-2 text-sm md:text-base bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Tambah Kategori
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Contoh: Seragam, Perlengkapan"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Deskripsi kategori (opsional)"
                />
              </div>

              <div className="flex gap-2 md:gap-3 pt-3 md:pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 md:py-2.5 text-sm md:text-base bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors"
                >
                  {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-base bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
