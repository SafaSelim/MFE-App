import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  username: string;
  roles: string[];
  email?: string;
  picture?: string;
  name?: string;
  provider?: 'local' | 'google' | 'azure';
}

// ============================================
// Configuration
// ============================================

// Runtime configuration
let config = {
  bffUrl: 'http://localhost:3003',
  useBff: false,
};

// Configure auth SDK at runtime
export function configureAuth(options: { bffUrl?: string; useBff?: boolean }): void {
  if (options.bffUrl !== undefined) config.bffUrl = options.bffUrl;
  if (options.useBff !== undefined) {
    config.useBff = options.useBff;
    // Clear legacy token when switching to BFF mode
    if (options.useBff) {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  }
}

// Getters for config
const getBffUrl = () => config.bffUrl;
const getUseBff = () => config.useBff;

// Legacy storage keys (for non-BFF mode)
const TOKEN_KEY = 'mfe_auth_token';
const USER_KEY = 'mfe_user';
const CSRF_KEY = 'mfe_csrf_token';

// ============================================
// BFF Auth Service (httpOnly cookies)
// ============================================

export class BFFAuthService {
  private static csrfToken: string | null = null;

  // Exchange Google credential for httpOnly session cookie
  static async loginWithGoogle(credential: string): Promise<{ user: User }> {
    const response = await fetch(`${getBffUrl()}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important: include cookies
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Authentication failed');
    }

    const data = await response.json();

    // Store CSRF token in memory (not localStorage!)
    this.csrfToken = data.csrfToken;
    sessionStorage.setItem(CSRF_KEY, data.csrfToken);

    // Store user info for UI (non-sensitive data)
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));

    // Notify other MFEs
    window.dispatchEvent(new CustomEvent('auth-changed', {
      detail: { user: data.user, authenticated: true }
    }));

    return { user: data.user };
  }

  // Get current user from BFF
  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${getBffUrl()}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch {
      return null;
    }
  }

  // Logout via BFF
  static async logout(): Promise<void> {
    const csrfToken = this.csrfToken || sessionStorage.getItem(CSRF_KEY);

    try {
      await fetch(`${getBffUrl()}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear local state
    this.csrfToken = null;
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(CSRF_KEY);

    // Notify other MFEs
    window.dispatchEvent(new CustomEvent('auth-changed', {
      detail: { user: null, authenticated: false }
    }));
  }

  // Check if authenticated
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  // Get CSRF token for protected requests
  static getCSRFToken(): string | null {
    return this.csrfToken || sessionStorage.getItem(CSRF_KEY);
  }

  // Get headers for API requests (CSRF only, cookie is automatic)
  static getAuthHeaders(): HeadersInit {
    const csrfToken = this.getCSRFToken();
    return csrfToken ? { 'X-CSRF-Token': csrfToken } : {};
  }

  // Refresh session
  static async refreshSession(): Promise<boolean> {
    const csrfToken = this.getCSRFToken();

    try {
      const response = await fetch(`${getBffUrl()}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        },
        credentials: 'include',
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

// ============================================
// Legacy Auth Service (sessionStorage)
// ============================================

export class AuthService {
  static setAuth(token: string, user: User): void {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));

    window.dispatchEvent(new CustomEvent('auth-changed', {
      detail: { token, user, authenticated: true }
    }));
  }

  static getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  static getUser(): User | null {
    const userStr = sessionStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);

    window.dispatchEvent(new CustomEvent('auth-changed', {
      detail: { token: null, user: null, authenticated: false }
    }));
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// ============================================
// Unified Auth Hook
// ============================================

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  getAuthHeaders: () => HeadersInit;
}

export function useAuth(): UseAuthReturn {
  // In BFF mode, don't trust sessionStorage until BFF confirms
  const [user, setUser] = useState<User | null>(() => {
    if (getUseBff()) {
      return null; // Will be set after BFF check
    }
    return AuthService.getUser();
  });
  const [isLoading, setIsLoading] = useState(getUseBff());

  // Check BFF session on mount
  useEffect(() => {
    if (getUseBff()) {
      BFFAuthService.getCurrentUser()
        .then((bffUser) => {
          if (bffUser) {
            setUser(bffUser);
            sessionStorage.setItem(USER_KEY, JSON.stringify(bffUser));
          } else {
            // No valid session - clear any stale data
            sessionStorage.removeItem(USER_KEY);
            sessionStorage.removeItem(CSRF_KEY);
          }
        })
        .catch(() => {
          // BFF unreachable - clear stale data
          sessionStorage.removeItem(USER_KEY);
          sessionStorage.removeItem(CSRF_KEY);
        })
        .finally(() => setIsLoading(false));
    }
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      setUser(customEvent.detail.user);
    };

    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, []);

  // Legacy login (direct token storage)
  const login = useCallback((token: string, userData: User) => {
    AuthService.setAuth(token, userData);
    setUser(userData);
  }, []);

  // BFF login with Google
  const loginWithGoogle = useCallback(async (credential: string) => {
    if (getUseBff()) {
      const result = await BFFAuthService.loginWithGoogle(credential);
      setUser(result.user);
    } else {
      // Fallback: decode JWT locally (less secure)
      const { jwtDecode } = await import('jwt-decode');
      const decoded: any = jwtDecode(credential);

      const userData: User = {
        id: decoded.sub,
        username: decoded.email?.split('@')[0] || 'user',
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        roles: ['user'],
        provider: 'google',
      };

      AuthService.setAuth(credential, userData);
      setUser(userData);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    if (getUseBff()) {
      await BFFAuthService.logout();
    } else {
      AuthService.logout();
    }
    setUser(null);
  }, []);

  // Get auth headers
  const getAuthHeaders = useCallback((): HeadersInit => {
    if (getUseBff()) {
      return BFFAuthService.getAuthHeaders();
    }
    return AuthService.getAuthHeaders();
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    logout,
    getAuthHeaders,
  };
}

export default {
  AuthService,
  BFFAuthService,
  useAuth,
  configureAuth,
};
