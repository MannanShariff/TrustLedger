import api from './api';

const auditService = {
  // Get audit logs with pagination and filters
  getAuditLogs: async (params = {}) => {
    try {
      const response = await api.get('/api/audit', { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch audit logs');
    }
  },

  // Get audit log by ID
  getAuditLogById: async (id) => {
    try {
      const response = await api.get(`/api/audit/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch audit log');
    }
  },

  // Get audit logs for a specific entity
  getEntityAuditLogs: async (entityType, entityId, params = {}) => {
    try {
      const response = await api.get(`/api/audit/entity/${entityType}/${entityId}`, { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch entity audit logs');
    }
  },

  // Get audit logs for a specific user
  getUserAuditLogs: async (userId, params = {}) => {
    try {
      const response = await api.get(`/api/audit/user/${userId}`, { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch user audit logs');
    }
  },

  // Export audit logs to CSV
  exportAuditLogs: async (params = {}) => {
    try {
      const response = await api.get('/api/audit/export', { 
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to export audit logs');
    }
  },
};

export default auditService;