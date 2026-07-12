import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const normalizeRole = (role) => {
    if (!role) return role;
    const map = {
      'FLEET_MANAGER': 'FleetManager',
      'DRIVER': 'Driver',
      'SAFETY_OFFICER': 'SafetyOfficer',
      'FINANCIAL_ANALYST': 'FinancialAnalyst',
      'TECHNICIAN': 'Technician',
      'ADMIN': 'FleetManager',
      'FleetManager': 'FleetManager',
      'Driver': 'Driver',
      'SafetyOfficer': 'SafetyOfficer',
      'FinancialAnalyst': 'FinancialAnalyst',
      'Technician': 'Technician',
    };
    return map[role] || role;
  };

  useEffect(() => {
    // Attempt to recover user from localStorage if token exists
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser) {
          parsedUser.role = normalizeRole(parsedUser.role);
        }
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        // Clean up invalid state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user && user.role === 'Driver' && token) {
      const fetchDriverProfileName = async () => {
        try {
          const res = await fetch('/api/drivers', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            const profile = data.data.find(d => d.email === user.email);
            if (profile && profile.name && profile.name !== user.name) {
              setUser(prev => ({ ...prev, name: profile.name }));
            }
          }
        } catch (err) {
          console.error('Error fetching driver profile name:', err);
        }
      };
      fetchDriverProfileName();
    }
  }, [token, user?.email, user?.role, user?.name]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      if (data.success && data.data?.token) {
        const { token, user } = data.data;
        if (user) {
          user.role = normalizeRole(user.role);
        }
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Invalid credentials';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
