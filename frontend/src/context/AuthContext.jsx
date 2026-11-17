import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('spendquest_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('spendquest_access_token');
      if (token) {
        try {
          const profile = await api.get('/auth/profile/');
          setUser(profile);
          localStorage.setItem('spendquest_user', JSON.stringify(profile));
        } catch (err) {
          console.error('Failed to restore session:', err);
        }
      } else {
        // Automatically initialize demo session so Home Page displays immediately on initial visit
        try {
          const res = await api.post('/auth/login/', {
            email: 'swetha@spendquest.io',
            password: 'password123'
          });
          api.setTokens(res.access, res.refresh);
          setUser(res.user);
          localStorage.setItem('spendquest_user', JSON.stringify(res.user));
        } catch (e) {}
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login/', { email, password });
    api.setTokens(res.access, res.refresh);
    setUser(res.user);
    localStorage.setItem('spendquest_user', JSON.stringify(res.user));
    return res.user;
  };

  const loginDemo = async () => {
    return await login('swetha@spendquest.io', 'password123');
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register/', formData);
    api.setTokens(res.access, res.refresh);
    setUser(res.user);
    localStorage.setItem('spendquest_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/', {
        refresh: api.refreshToken,
        access: api.accessToken
      });
    } catch (e) {
      // Ignore network failure on logout
    } finally {
      api.clearTokens();
      setUser(null);
      localStorage.removeItem('spendquest_user');
    }
  };

  const updateProfile = async (data) => {
    const updated = await api.patch('/auth/profile/', data);
    setUser(updated);
    localStorage.setItem('spendquest_user', JSON.stringify(updated));
    return updated;
  };

  const changePassword = async (current_password, new_password) => {
    return await api.post('/auth/change-password/', { current_password, new_password });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginDemo,
        register,
        logout,
        updateProfile,
        changePassword,
        currency: user?.currency || 'INR'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
