'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, clearAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useTheme } from '@/contexts/ThemeContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </ProtectedRoute>
  );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default false untuk mobile-first
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    // Set sidebar open by default on desktop only
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Listen to resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const { user: authUser } = getAuth();
    setUser(authUser);
    
    // Auto open product menu if on product-related page
    if (pathname.startsWith('/dashboard/products') || pathname.startsWith('/dashboard/categories')) {
      setProductMenuOpen(true);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      roles: ['OWNER', 'MANAGER'],
    },
    {
      name: 'Produk',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      roles: ['OWNER', 'MANAGER'],
      subMenu: [
        {
          name: 'Semua Produk',
          path: '/dashboard/products',
        },
        {
          name: 'Tambah Baru',
          path: '/dashboard/products/new',
        },
        {
          name: 'Kategori',
          path: '/dashboard/categories',
        },
      ],
    },
    {
      name: 'Transaksi',
      path: '/dashboard/transactions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      roles: ['OWNER', 'MANAGER'],
    },
    {
      name: 'Laporan',
      path: '/dashboard/reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      roles: ['OWNER', 'MANAGER'],
    },
    {
      name: 'Users',
      path: '/dashboard/users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      roles: ['OWNER'],
    },
    {
      name: 'Settings',
      path: '/dashboard/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      roles: ['OWNER', 'MANAGER'],
    },
  ];
  
  const filteredMenuItems = menuItems.filter((item) => {
    // Filter by role
    if (!user?.role || !item.roles.includes(user.role)) {
      return false;
    }
    
    return true;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Mobile Overlay - untuk close sidebar saat klik di luar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl ${
            sidebarOpen ? 'w-72' : 'w-16'
          }`}
        >
          <div className="h-full flex flex-col overflow-hidden">
            {/* Logo & Hamburger - STICKY */}
            <div className="flex items-center justify-between px-3 py-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
              {sidebarOpen ? (
                <>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl mr-3 shadow-md flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">AnekaBuana Store</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Inventory System</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all flex-shrink-0 ml-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-10 h-10 mx-auto flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
              {filteredMenuItems.map((item) => {
                // Check if item has submenu
                if (item.subMenu) {
                  const isAnySubActive = item.subMenu.some((sub: any) => pathname === sub.path || pathname.startsWith(sub.path + '/'));
                  
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => {
                          if (sidebarOpen) {
                            setProductMenuOpen(!productMenuOpen);
                          } else {
                            // Jika sidebar minimize, buka sidebar dulu baru toggle menu
                            setSidebarOpen(true);
                            setProductMenuOpen(true);
                          }
                        }}
                        className={`w-full flex items-center ${sidebarOpen ? 'justify-between px-4' : 'justify-center px-2'} py-2.5 rounded-lg font-medium transition-all duration-150 ${
                          isAnySubActive
                            ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={!sidebarOpen ? item.name : ''}
                      >
                        <div className={`flex items-center ${sidebarOpen ? 'gap-3' : ''}`}>
                          {item.icon}
                          {sidebarOpen && <span className="text-sm">{item.name}</span>}
                        </div>
                        {sidebarOpen && (
                          <svg 
                            className={`w-4 h-4 transition-transform duration-200 ${productMenuOpen ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>
                      
                      {/* Submenu - only show when sidebar is open */}
                      {sidebarOpen && (
                        <div className={`overflow-hidden transition-all duration-200 ${productMenuOpen ? 'max-h-40 mt-1' : 'max-h-0'}`}>
                          <div className="space-y-0.5 ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                            {item.subMenu.map((subItem: any) => {
                              const isSubActive = pathname === subItem.path || (pathname.startsWith(subItem.path + '/') && subItem.path !== '/dashboard/products');
                              return (
                                <a
                                  key={subItem.path}
                                  href={subItem.path}
                                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                    isSubActive
                                      ? 'bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                                  }`}
                                >
                                  {subItem.name}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                
                // Regular menu item without submenu
                const isActive = pathname === item.path;
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={!sidebarOpen ? item.name : ''}
                  >
                    {item.icon}
                    {sidebarOpen && <span>{item.name}</span>}
                  </a>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-16'}`}>
          {/* Header - STICKY */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300 sticky top-0 z-30">
            <div className="px-4 md:px-6 py-3 md:py-4">
              {/* Mobile: Title + User Dropdown */}
              <div className="flex items-center justify-between md:hidden mb-2">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  {pathname === '/dashboard' ? 'Dashboard' :
                   pathname.includes('/products') ? 'Produk' :
                   pathname.includes('/transactions') ? 'Transaksi' :
                   pathname.includes('/reports') ? 'Laporan' :
                   pathname.includes('/users') ? 'Users' :
                   pathname.includes('/settings') ? 'Settings' :
                   pathname.includes('/categories') ? 'Kategori' : 'Dashboard'}
                </h1>
                
                {/* User Dropdown - Mobile */}
                {user && (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-2 py-1.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <div className="w-7 h-7 flex items-center justify-center bg-white/20 rounded-full text-xs font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold">{user.name.split(' ')[0]}</span>
                      <svg className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                          {/* User Info */}
                          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{user.email}</p>
                            <span className="inline-block mt-2 px-2 py-0.5 text-xs font-bold bg-slate-600 text-white rounded uppercase">
                              {user.role}
                            </span>
                          </div>
                          
                          {/* Branch Info */}
                          {user.cabang && (
                            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Cabang</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.cabang.name}</p>
                            </div>
                          )}
                          
                          {/* Dark Mode Toggle */}
                          <button
                            onClick={() => {
                              toggleTheme();
                              setUserMenuOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                          >
                            {theme === 'dark' ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                              </svg>
                            )}
                            <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
                          </button>
                          
                          {/* Logout */}
                          <button
                            onClick={() => {
                              handleLogout();
                              setUserMenuOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Desktop: Full navbar with page title, greeting, and date */}
              <div className="hidden md:flex items-center justify-between">
                {/* Left: Page title + greeting */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {pathname === '/dashboard' ? 'Dashboard' :
                     pathname.includes('/products') ? 'Kelola Produk' :
                     pathname.includes('/transactions') ? 'Transaksi' :
                     pathname.includes('/reports') ? 'Laporan' :
                     pathname.includes('/users') ? 'Manajemen Users' :
                     pathname.includes('/settings') ? 'Pengaturan' :
                     pathname.includes('/categories') ? 'Kategori Produk' : 'Dashboard'}
                  </h1>
                  {user && pathname === '/dashboard' && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Selamat datang kembali, <span className="font-semibold">{user.name}</span>
                    </p>
                  )}
                </div>
                
                {/* Right: Date + User Dropdown */}
                <div className="flex items-center gap-4">
                  {/* Date */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/30 dark:to-slate-800/30 rounded-lg">
                    <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {new Date().toLocaleDateString('id-ID', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  
                  {/* User Dropdown - Desktop */}
                  {user && (
                    <div className="relative">
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        <div className="w-7 h-7 flex items-center justify-center bg-white/20 rounded-full text-xs font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-semibold">{user.name}</p>
                          <p className="text-xs opacity-80">{user.role}</p>
                        </div>
                        <svg className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Dropdown Menu */}
                      {userMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{user.email}</p>
                              <span className="inline-block mt-2 px-2 py-0.5 text-xs font-bold bg-slate-600 text-white rounded uppercase">
                                {user.role}
                              </span>
                            </div>
                            
                            {/* Branch Info */}
                            {user.cabang && (
                              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Cabang</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.cabang.name}</p>
                              </div>
                            )}
                            
                            {/* Dark Mode Toggle */}
                            <button
                              onClick={() => {
                                toggleTheme();
                                setUserMenuOpen(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                            >
                              {theme === 'dark' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                              )}
                              <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
                            </button>
                            
                            {/* Logout */}
                            <button
                              onClick={() => {
                                handleLogout();
                                setUserMenuOpen(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <span>Logout</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Mobile: Date */}
              <div className="flex md:hidden items-center justify-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/30 dark:to-slate-800/30 rounded-lg">
                <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6 min-h-screen">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
