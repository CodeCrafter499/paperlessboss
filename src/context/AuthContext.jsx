import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, tokenStore } from '../utils/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) { setLoading(false); return; }
    authApi.getProfile(token)
      .then((profile) => setUser({ ...profile, token }))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    tokenStore.set(data.access_token);
    const profile = await authApi.getProfile(data.access_token);
    setUser({ ...profile, token: data.access_token });
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
