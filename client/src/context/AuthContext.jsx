import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const DEFAULT_DEVELOPER = {
  id: 'usr-developer-01',
  name: 'MHN Developer',
  email: 'developer@mhntab.edu',
  role: 'admin',
  created_at: '2026-01-01T00:00:00.000Z'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ojt_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_DEVELOPER, ...parsed, role: 'admin' };
      }
    } catch (e) {}
    return DEFAULT_DEVELOPER;
  });

  useEffect(() => {
    try {
      localStorage.setItem('ojt_user', JSON.stringify(user));
    } catch (e) {}
  }, [user]);

  const login = async () => DEFAULT_DEVELOPER;
  const register = async () => DEFAULT_DEVELOPER;
  const logout = () => {
    setUser(DEFAULT_DEVELOPER);
  };

  return (
    <AuthContext.Provider value={{ user, loading: false, login, register, logout, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
