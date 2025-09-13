import api from './api';

const transactionService = {
  // Get all transactions
  getTransactions: async (params = {}) => {
    try {
      const response = await api.get('/api/transactions', { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch transactions');
    }
  },

  // Get transaction by ID
  getTransactionById: async (id) => {
    try {
      const response = await api.get(`/api/transactions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch transaction');
    }
  },

  // Create new transaction
  createTransaction: async (transactionData) => {
    // Handle file uploads with FormData
    const formData = new FormData();
    
    // Add receipt file if it exists
    if (transactionData.receipt && transactionData.receipt instanceof File) {
      formData.append('receipt', transactionData.receipt);
      delete transactionData.receipt;
    }
    
    // Add other transaction data
    formData.append('data', JSON.stringify(transactionData));
    
    try {
      const response = await api.post('/api/transactions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to create transaction');
    }
  },

  // Update transaction
  updateTransaction: async (id, transactionData) => {
    // Handle file uploads with FormData
    const formData = new FormData();
    
    // Add receipt file if it exists
    if (transactionData.receipt && transactionData.receipt instanceof File) {
      formData.append('receipt', transactionData.receipt);
      delete transactionData.receipt;
    }
    
    // Add other transaction data
    formData.append('data', JSON.stringify(transactionData));
    
    try {
      const response = await api.put(`/api/transactions/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update transaction');
    }
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    try {
      const response = await api.delete(`/api/transactions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to delete transaction');
    }
  },

  // Get transaction receipt
  getTransactionReceipt: async (id) => {
    try {
      const response = await api.get(`/api/transactions/${id}/receipt`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch transaction receipt');
    }
  },

  // Verify transaction hash
  verifyTransactionHash: async (id, hash) => {
    try {
      const response = await api.post(`/api/transactions/${id}/verify`, { hash });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to verify transaction hash');
    }
  },
};

export default transactionService;