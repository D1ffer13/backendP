// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
