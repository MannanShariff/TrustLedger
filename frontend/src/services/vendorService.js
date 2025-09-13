import api from './api';

const vendorService = {
  // Get all vendors
  getVendors: async () => {
    try {
      const response = await api.get('/api/vendors');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch vendors');
    }
  },

  // Get vendor by ID
  getVendorById: async (id) => {
    try {
      const response = await api.get(`/api/vendors/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch vendor');
    }
  },

  // Create new vendor
  createVendor: async (vendorData) => {
    try {
      const response = await api.post('/api/vendors', vendorData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to create vendor');
    }
  },

  // Update vendor
  updateVendor: async (id, vendorData) => {
    try {
      const response = await api.put(`/api/vendors/${id}`, vendorData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update vendor');
    }
  },

  // Delete vendor
  deleteVendor: async (id) => {
    try {
      const response = await api.delete(`/api/vendors/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to delete vendor');
    }
  },

  // Get vendor transactions
  getVendorTransactions: async (id) => {
    try {
      const response = await api.get(`/api/vendors/${id}/transactions`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch vendor transactions');
    }
  },
};

export default vendorService;