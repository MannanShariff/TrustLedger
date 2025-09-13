import api from './api';

const projectService = {
  // Get all projects
  getProjects: async () => {
    try {
      const response = await api.get('/api/projects');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch projects');
    }
  },

  // Get project by ID
  getProjectById: async (id) => {
    try {
      const response = await api.get(`/api/projects/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch project');
    }
  },

  // Create new project
  createProject: async (projectData) => {
    try {
      const response = await api.post('/api/projects', projectData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to create project');
    }
  },

  // Update project
  updateProject: async (id, projectData) => {
    try {
      const response = await api.put(`/api/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update project');
    }
  },

  // Delete project
  deleteProject: async (id) => {
    try {
      const response = await api.delete(`/api/projects/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to delete project');
    }
  },

  // Get project transactions
  getProjectTransactions: async (id) => {
    try {
      const response = await api.get(`/api/projects/${id}/transactions`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch project transactions');
    }
  },

  // Get project budget usage
  getProjectBudgetUsage: async (id) => {
    try {
      const response = await api.get(`/api/projects/${id}/budget-usage`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch project budget usage');
    }
  },
};

export default projectService;