/**
 * SIMCUTI — AuthContext
 * Global authentication state management menggunakan React Context.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true saat initial check

  // Restore session dari localStorage saat app load
  useEffect(() => {
    const savedToken = localStorage.getItem('simcuti_token');
    const savedUser = localStorage.getItem('simcuti_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('simcuti_token');
        localStorage.removeItem('simcuti_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authAPI.login(email, password);
    localStorage.setItem('simcuti_token', data.access_token);
    localStorage.setItem('simcuti_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const newUser = await authAPI.register(formData);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('simcuti_token');
    localStorage.removeItem('simcuti_user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const fresh = await authAPI.me();
      setUser(fresh);
      localStorage.setItem('simcuti_user', JSON.stringify(fresh));
    } catch {
      logout();
    }
  }, [logout]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isKaryawan: user?.role === 'karyawan',
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return ctx;
}
