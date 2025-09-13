import api from './api';

const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Registration failed');
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Login failed');
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to get user profile');
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/api/auth/profile', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update profile');
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/api/auth/password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to change password');
    }
  },

  // Get all users (admin only)
  getUsers: async () => {
    try {
      const response = await api.get('/api/users');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to get users');
    }
  },
};

export default authService;