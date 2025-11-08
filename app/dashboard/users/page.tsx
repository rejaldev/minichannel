'use client';

import { useEffect, useState } from 'react';
import { authAPI } from '@/lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'KASIR',
    cabangId: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await authAPI.getUsers();
      // API returns array directly, not wrapped in data object
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Gagal memuat data users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          name: formData.name,
          role: formData.role,
          cabangId: formData.cabangId,
        };
        
        // Only include password if it's filled
        if (formData.password && formData.password.trim() !== '') {
          updateData.password = formData.password;
        }

        await authAPI.updateUser(editingUser.id, updateData);
        alert('User berhasil diupdate!');
      } else {
        // Create new user
        await authAPI.createUser(formData);
        alert('User berhasil ditambahkan!');
      }
      
      setShowModal(false);
      setEditingUser(null);
      setFormData({ email: '', password: '', name: '', role: 'KASIR', cabangId: '' });
      fetchUsers();
    } catch (error: any) {
      console.error('Save user error:', error);
      alert(error.response?.data?.error || `Gagal ${editingUser ? 'update' : 'menambah'} user`);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      role: user.role,
      cabangId: user.cabangId || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ email: '', password: '', name: '', role: 'KASIR', cabangId: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          + Tambah User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Cabang
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Dibuat
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'OWNER'
                        ? 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300'
                        : user.role === 'MANAGER'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {user.cabang?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingUser ? 'Edit User' : 'Tambah User Baru'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                />
                {editingUser && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email tidak bisa diubah</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password {editingUser && '(kosongkan jika tidak diubah)'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={editingUser ? '••••••••' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="KASIR">KASIR</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="OWNER">OWNER</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cabang ID
                </label>
                <input
                  type="text"
                  required
                  value={formData.cabangId}
                  onChange={(e) => setFormData({ ...formData, cabangId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="cmhop1v3u0000wgv8iaarkggo"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">ID cabang yang sudah ada</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
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
