import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type User = { id: string; name: string; email: string };
type AuthValue = {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('pawpal_user') || 'null'); } catch { return null; }
  });
  const logout = () => {
    localStorage.removeItem('pawpal_token');
    localStorage.removeItem('pawpal_user');
    setUser(null);
  };
  useEffect(() => {
    window.addEventListener('pawpal:logout', logout);
    return () => window.removeEventListener('pawpal:logout', logout);
  }, []);
  const login = (token: string, nextUser: User) => {
    localStorage.setItem('pawpal_token', token);
    localStorage.setItem('pawpal_user', JSON.stringify(nextUser));
    setUser(nextUser);
  };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be inside AuthProvider');
  return value;
}
