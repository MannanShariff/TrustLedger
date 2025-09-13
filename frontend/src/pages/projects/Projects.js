import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentId: '',
    allocatedAmount: '',
    status: 'planned'
  });
  const [editMode, setEditMode] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  
  const { user } = useContext(AuthContext);
  const isAdmin = user && user.role === 'admin';
  const isDepartmentHead = user && (user.role === 'department_head' || user.role === 'admin');
  const isProjectManager = user && (user.role === 'project_manager' || user.role === 'department_head' || user.role === 'admin');

  // Fetch projects and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, departmentsRes] = await Promise.all([
          axios.get('/api/projects'),
          axios.get('/api/departments')
        ]);
        setProjects(projectsRes.data);
        setDepartments(departmentsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.departmentId || !formData.allocatedAmount || !formData.status) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editMode) {
        // Update existing project
        await axios.put(`/api/projects/${currentProjectId}`, formData);
        toast.success('Project updated successfully');
      } else {
        // Create new project
        await axios.post('/api/projects', formData);
        toast.success('Project created successfully');
      }
      
      // Reset form and fetch updated projects
      setFormData({
        name: '',
        description: '',
        departmentId: '',
        allocatedAmount: '',
        status: 'planned'
      });
      setEditMode(false);
      setCurrentProjectId(null);
      
      // Refresh projects list
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Error saving project:', err);
      toast.error('Failed to save project');
    }
  };

  // Handle edit button click
  const handleEdit = (project) => {
    setFormData({
      name: project.name,
      description: project.description || '',
      departmentId: project.departmentId._id || project.departmentId,
      allocatedAmount: project.allocatedAmount,
      status: project.status
    });
    setEditMode(true);
    setCurrentProjectId(project._id);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`/api/projects/${id}`);
        toast.success('Project deleted successfully');
        
        // Remove deleted project from state
        setProjects(projects.filter(project => project._id !== id));
      } catch (err) {
        console.error('Error deleting project:', err);
        toast.error('Failed to delete project');
      }
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get department name by ID
  const getDepartmentName = (departmentId) => {
    const department = departments.find(d => d._id === departmentId);
    return department ? department.name : 'Unknown Department';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Project Management</h1>
      
      {isProjectManager && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{editMode ? 'Edit Project' : 'Create New Project'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department*</label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a department</option>
                  {departments.map(department => (
                    <option key={department._id} value={department._id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allocated Amount*</label>
                <input
                  type="number"
                  name="allocatedAmount"
                  value={formData.allocatedAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editMode ? 'Update Project' : 'Create Project'}
              </button>
              
              {editMode && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: '',
                      description: '',
                      departmentId: '',
                      allocatedAmount: '',
                      status: 'planned'
                    });
                    setEditMode(false);
                    setCurrentProjectId(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Project List</h2>
          
          {loading ? (
            <p className="text-gray-500">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-gray-500">No projects found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    {isProjectManager && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {project.departmentId && project.departmentId.name 
                            ? project.departmentId.name 
                            : getDepartmentName(project.departmentId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatCurrency(project.allocatedAmount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-800' : project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' : project.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs">{project.description || '-'}</div>
                      </td>
                      {isProjectManager && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(project)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          {(isAdmin || isDepartmentHead) && (
                            <button
                              onClick={() => handleDelete(project._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;