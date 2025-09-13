import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set auth token
  useEffect(() => {
    if (token) {
      setAuthToken(token);
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          // Token expired
          logout();
        } else {
          loadUser();
        }
      } catch (err) {
        logout();
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  // Set axios auth header
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Load user
  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data.data);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading user');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      const res = await axios.post('/api/auth/register', formData);
      setToken(res.data.token);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await axios.post('/api/auth/login', formData);
      setToken(res.data.token);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
      return { success: false, error: err.response?.data?.message || 'Invalid credentials' };
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Clear errors
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        loading,
        user,
        error,
        register,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;