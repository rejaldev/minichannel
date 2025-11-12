'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, clearAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useTheme } from '@/contexts/ThemeContext';
import { isElectron } from '@/lib/platform';

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
  const [inElectron, setInElectron] = useState(false);

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
    
    // Check if running in Electron
    setInElectron(isElectron());
    
    // KASIR should ONLY use desktop app, block web access
    if (authUser?.role === 'KASIR' && !isElectron()) {
      router.replace('/access-denied');
      return;
    }
    
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

            {/* User Info */}
            {user && (
              <div className={`mx-3 my-4 transition-all ${
                sidebarOpen 
                  ? 'p-3.5 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/30 dark:to-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700'
                  : 'p-2 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center'
              }`}>
                {sidebarOpen ? (
                  <>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 truncate">{user.email}</p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-bold bg-slate-600 text-white rounded-full uppercase tracking-wide">
                        {user.role}
                      </span>
                      {user.cabang && (
                        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium truncate">
                          {user.cabang.name}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center text-white font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            {sidebarOpen && (
              <div className="px-4 mb-2">
                <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
              </div>
            )}

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

            {/* Bottom Section - STICKY */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-3 space-y-1 bg-white dark:bg-gray-800 sticky bottom-0 z-10">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm font-medium`}
                title={!sidebarOpen ? 'Dark Mode' : ''}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
                {sidebarOpen && (
                  <>
                    <span>Dark Mode</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {theme === 'dark' ? 'On' : 'Off'}
                    </span>
                  </>
                )}
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-all text-sm font-medium`}
                title={!sidebarOpen ? 'Logout' : ''}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {sidebarOpen && <span>Logout</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-16'}`}>
          {/* Header - STICKY */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300 sticky top-0 z-30">
            <div className="px-6 py-4 flex items-center justify-end">
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/30 dark:to-slate-800/30 rounded-xl">
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {new Date().toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
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
