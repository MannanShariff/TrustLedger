import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentId: '',
    allocatedAmount: '',
    startDate: '',
    endDate: '',
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
    if (!formData.name || !formData.departmentId || !formData.allocatedAmount || !formData.startDate || !formData.endDate) {
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
        startDate: '',
        endDate: '',
        status: 'planned'
      });
      setEditMode(false);
      setCurrentProjectId(null);

      // Fetch updated projects
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Error saving project:', err);
      toast.error(err.response?.data?.message || 'Failed to save project');
    }
  };

  // Handle edit project
  const handleEdit = (project) => {
    setFormData({
      name: project.name,
      description: project.description || '',
      departmentId: project.departmentId,
      allocatedAmount: project.allocatedAmount,
      startDate: project.startDate.split('T')[0],
      endDate: project.endDate.split('T')[0],
      status: project.status
    });
    setEditMode(true);
    setCurrentProjectId(project._id);
  };

  // Handle delete project
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated transactions.')) {
      try {
        await axios.delete(`/api/projects/${id}`);
        toast.success('Project deleted successfully');
        setProjects(projects.filter(project => project._id !== id));
      } catch (err) {
        console.error('Error deleting project:', err);
        toast.error(err.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  // Cancel edit mode
  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      departmentId: '',
      allocatedAmount: '',
      startDate: '',
      endDate: '',
      status: 'planned'
    });
    setEditMode(false);
    setCurrentProjectId(null);
  };

  // Get department name by ID
  const getDepartmentName = (departmentId) => {
    const department = departments.find(d => d._id === departmentId);
    return department ? department.name : 'Unknown Department';
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Project Management</h1>
      
      {isProjectManager && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department*</label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(department => (
                    <option key={department._id} value={department._id}>
                      {department.name} (₹{department.allocatedAmount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allocated Amount (₹)*</label>
                <input
                  type="number"
                  name="allocatedAmount"
                  value={formData.allocatedAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date*</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date*</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  rows="2"
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-2">
              {editMode && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {editMode ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                {isProjectManager && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <tr key={project._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{getDepartmentName(project.departmentId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">₹{project.allocatedAmount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(project.status)}`}>
                        {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{project.description || '-'}</div>
                    </td>
                    {isProjectManager && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(project)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isProjectManager ? 7 : 6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No projects found. {isProjectManager && 'Create your first project above.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Projects;