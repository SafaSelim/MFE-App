import { useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  roles: string[];
  email?: string;
  picture?: string;
  name?: string;
  provider?: 'local' | 'google';
}

const TOKEN_KEY = 'mfe_auth_token';
const USER_KEY = 'mfe_user';

export class AuthService {
  static setAuth(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    window.dispatchEvent(new CustomEvent('auth-changed', { 
      detail: { token, user } 
    }));
  }

  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    window.dispatchEvent(new CustomEvent('auth-changed', { 
      detail: { token: null, user: null } 
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

export function useAuth() {
  const [token, setToken] = useState<string | null>(AuthService.getToken());
  const [user, setUser] = useState<User | null>(AuthService.getUser());

  useEffect(() => {
    const handleAuthChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      setToken(customEvent.detail.token);
      setUser(customEvent.detail.user);
    };

    window.addEventListener('auth-changed', handleAuthChange);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  return {
    token,
    user,
    isAuthenticated: !!token,
    login: AuthService.setAuth,
    logout: AuthService.logout,
    getAuthHeaders: AuthService.getAuthHeaders,
  };
}

export default {
  AuthService,
  useAuth,
};