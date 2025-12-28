import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setAuth, getAuth, clearAuth, isAuthenticated, hasRole, User } from './auth';

describe('auth', () => {
  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'OWNER',
    cabangId: 'cabang-1',
    isActive: true,
    cabang: {
      id: 'cabang-1',
      name: 'Main Branch',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie = '';
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  describe('setAuth', () => {
    it('should store token and user in localStorage', () => {
      setAuth('test-token', mockUser);

      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it('should set cookie with user data', () => {
      setAuth('test-token', mockUser);

      expect(document.cookie).toContain('user=');
    });
  });

  describe('getAuth', () => {
    it('should return token and user from localStorage', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>)
        .mockImplementation((key: string) => {
          if (key === 'token') return 'test-token';
          if (key === 'user') return JSON.stringify(mockUser);
          return null;
        });

      const result = getAuth();

      expect(result.token).toBe('test-token');
      expect(result.user).toEqual(mockUser);
    });

    it('should return null when no auth data exists', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);

      const result = getAuth();

      expect(result.token).toBeNull();
      expect(result.user).toBeNull();
    });
  });

  describe('clearAuth', () => {
    it('should remove token and user from localStorage', () => {
      clearAuth();

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>)
        .mockImplementation((key: string) => {
          if (key === 'token') return 'test-token';
          return null;
        });

      expect(isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);

      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has allowed role', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>)
        .mockImplementation((key: string) => {
          if (key === 'user') return JSON.stringify(mockUser);
          return null;
        });

      expect(hasRole(['OWNER', 'MANAGER'])).toBe(true);
    });

    it('should return false when user does not have allowed role', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>)
        .mockImplementation((key: string) => {
          if (key === 'user') return JSON.stringify({ ...mockUser, role: 'KASIR' });
          return null;
        });

      expect(hasRole(['OWNER', 'MANAGER'])).toBe(false);
    });

    it('should return false when no user exists', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);

      expect(hasRole(['OWNER'])).toBe(false);
    });
  });
});
