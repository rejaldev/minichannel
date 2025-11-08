export interface User {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'MANAGER' | 'KASIR';
  cabangId: string;
  isActive: boolean;
  cabang?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
  };
}

export const setAuth = (token: string, user: User) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const getAuth = (): { token: string | null; user: User | null } => {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  return { token, user };
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  const { token } = getAuth();
  return !!token;
};

export const hasRole = (allowedRoles: string[]): boolean => {
  const { user } = getAuth();
  return user ? allowedRoles.includes(user.role) : false;
};
