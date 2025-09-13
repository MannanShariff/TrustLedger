import api from './api';

const budgetService = {
  // Get all budgets
  getBudgets: async () => {
    try {
      const response = await api.get('/api/budgets');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch budgets');
    }
  },

  // Get budget by ID
  getBudgetById: async (id) => {
    try {
      const response = await api.get(`/api/budgets/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch budget');
    }
  },

  // Create new budget
  createBudget: async (budgetData) => {
    try {
      const response = await api.post('/api/budgets', budgetData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to create budget');
    }
  },

  // Update budget
  updateBudget: async (id, budgetData) => {
    try {
      const response = await api.put(`/api/budgets/${id}`, budgetData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update budget');
    }
  },

  // Delete budget
  deleteBudget: async (id) => {
    try {
      const response = await api.delete(`/api/budgets/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to delete budget');
    }
  },

  // Get budget allocations
  getBudgetAllocations: async (id) => {
    try {
      const response = await api.get(`/api/budgets/${id}/allocations`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch budget allocations');
    }
  },

  // Get budget spending
  getBudgetSpending: async (id) => {
    try {
      const response = await api.get(`/api/budgets/${id}/spending`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch budget spending');
    }
  },
};

export default budgetService;