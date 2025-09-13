import api from './api';

const departmentService = {
  // Get all departments
  getDepartments: async () => {
    try {
      const response = await api.get('/api/departments');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch departments');
    }
  },

  // Get department by ID
  getDepartmentById: async (id) => {
    try {
      const response = await api.get(`/api/departments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch department');
    }
  },

  // Create new department
  createDepartment: async (departmentData) => {
    try {
      const response = await api.post('/api/departments', departmentData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to create department');
    }
  },

  // Update department
  updateDepartment: async (id, departmentData) => {
    try {
      const response = await api.put(`/api/departments/${id}`, departmentData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update department');
    }
  },

  // Delete department
  deleteDepartment: async (id) => {
    try {
      const response = await api.delete(`/api/departments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to delete department');
    }
  },

  // Get department budget allocations
  getDepartmentAllocations: async (id) => {
    try {
      const response = await api.get(`/api/departments/${id}/allocations`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch department allocations');
    }
  },

  // Get department projects
  getDepartmentProjects: async (id) => {
    try {
      const response = await api.get(`/api/departments/${id}/projects`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch department projects');
    }
  },
};

export default departmentService;