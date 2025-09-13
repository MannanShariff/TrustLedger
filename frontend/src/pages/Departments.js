import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budgetId: '',
    allocatedAmount: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [currentDepartmentId, setCurrentDepartmentId] = useState(null);
  
  const { user } = useContext(AuthContext);
  const isAdmin = user && user.role === 'admin';
  const isDepartmentHead = user && (user.role === 'department_head' || user.role === 'admin');

  // Fetch departments and budgets
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [departmentsRes, budgetsRes] = await Promise.all([
          axios.get('/api/departments'),
          axios.get('/api/budgets')
        ]);
        setDepartments(departmentsRes.data);
        setBudgets(budgetsRes.data);
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
    if (!formData.name || !formData.budgetId || !formData.allocatedAmount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editMode) {
        // Update existing department
        await axios.put(`/api/departments/${currentDepartmentId}`, formData);
        toast.success('Department updated successfully');
      } else {
        // Create new department
        await axios.post('/api/departments', formData);
        toast.success('Department created successfully');
      }

      // Reset form and fetch updated departments
      setFormData({
        name: '',
        description: '',
        budgetId: '',
        allocatedAmount: ''
      });
      setEditMode(false);
      setCurrentDepartmentId(null);

      // Fetch updated departments
      const res = await axios.get('/api/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error('Error saving department:', err);
      toast.error(err.response?.data?.message || 'Failed to save department');
    }
  };

  // Handle edit department
  const handleEdit = (department) => {
    setFormData({
      name: department.name,
      description: department.description || '',
      budgetId: department.budgetId,
      allocatedAmount: department.allocatedAmount
    });
    setEditMode(true);
    setCurrentDepartmentId(department._id);
  };

  // Handle delete department
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department? This will also delete all associated projects and transactions.')) {
      try {
        await axios.delete(`/api/departments/${id}`);
        toast.success('Department deleted successfully');
        setDepartments(departments.filter(department => department._id !== id));
      } catch (err) {
        console.error('Error deleting department:', err);
        toast.error(err.response?.data?.message || 'Failed to delete department');
      }
    }
  };

  // Cancel edit mode
  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      budgetId: '',
      allocatedAmount: ''
    });
    setEditMode(false);
    setCurrentDepartmentId(null);
  };

  // Get budget name by ID
  const getBudgetName = (budgetId) => {
    const budget = budgets.find(b => b._id === budgetId);
    return budget ? budget.name : 'Unknown Budget';
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
      <h1 className="text-3xl font-bold mb-6 text-primary">Department Management</h1>
      
      {isDepartmentHead && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{editMode ? 'Edit Department' : 'Create New Department'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name*</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget*</label>
                <select
                  name="budgetId"
                  value={formData.budgetId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="">Select Budget</option>
                  {budgets.map(budget => (
                    <option key={budget._id} value={budget._id}>
                      {budget.name} (₹{budget.totalAmount.toLocaleString()}) - FY {budget.fiscalYear}
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
                {editMode ? 'Update Department' : 'Create Department'}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                {isDepartmentHead && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.length > 0 ? (
                departments.map((department) => (
                  <tr key={department._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{department.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{getBudgetName(department.budgetId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">₹{department.allocatedAmount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{department.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{new Date(department.createdAt).toLocaleDateString()}</div>
                    </td>
                    {isDepartmentHead && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(department)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(department._id)}
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
                  <td colSpan={isDepartmentHead ? 6 : 5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No departments found. {isDepartmentHead && 'Create your first department above.'}
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

export default Departments;