import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fiscalYear: new Date().getFullYear(),
    totalAmount: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [currentBudgetId, setCurrentBudgetId] = useState(null);
  
  const { user } = useContext(AuthContext);
  const isAdmin = user && user.role === 'admin';

  // Fetch budgets
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await axios.get('/api/budgets');
        setBudgets(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching budgets:', err);
        toast.error('Failed to fetch budgets');
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.fiscalYear || !formData.totalAmount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editMode) {
        // Update existing budget
        await axios.put(`/api/budgets/${currentBudgetId}`, formData);
        toast.success('Budget updated successfully');
      } else {
        // Create new budget
        await axios.post('/api/budgets', formData);
        toast.success('Budget created successfully');
      }

      // Reset form and fetch updated budgets
      setFormData({
        name: '',
        description: '',
        fiscalYear: new Date().getFullYear(),
        totalAmount: ''
      });
      setEditMode(false);
      setCurrentBudgetId(null);

      // Fetch updated budgets
      const res = await axios.get('/api/budgets');
      setBudgets(res.data);
    } catch (err) {
      console.error('Error saving budget:', err);
      toast.error(err.response?.data?.message || 'Failed to save budget');
    }
  };

  // Handle edit budget
  const handleEdit = (budget) => {
    setFormData({
      name: budget.name,
      description: budget.description || '',
      fiscalYear: budget.fiscalYear,
      totalAmount: budget.totalAmount
    });
    setEditMode(true);
    setCurrentBudgetId(budget._id);
  };

  // Handle delete budget
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget? This will also delete all associated departments, projects, and transactions.')) {
      try {
        await axios.delete(`/api/budgets/${id}`);
        toast.success('Budget deleted successfully');
        setBudgets(budgets.filter(budget => budget._id !== id));
      } catch (err) {
        console.error('Error deleting budget:', err);
        toast.error(err.response?.data?.message || 'Failed to delete budget');
      }
    }
  };

  // Cancel edit mode
  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      fiscalYear: new Date().getFullYear(),
      totalAmount: ''
    });
    setEditMode(false);
    setCurrentBudgetId(null);
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
      <h1 className="text-3xl font-bold mb-6 text-primary">Budget Management</h1>
      
      {isAdmin && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{editMode ? 'Edit Budget' : 'Create New Budget'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Name*</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Year*</label>
                <input
                  type="number"
                  name="fiscalYear"
                  value={formData.fiscalYear}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹)*</label>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
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
                {editMode ? 'Update Budget' : 'Create Budget'}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiscal Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                {isAdmin && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgets.length > 0 ? (
                budgets.map((budget) => (
                  <tr key={budget._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{budget.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{budget.fiscalYear}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">₹{budget.totalAmount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{budget.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{new Date(budget.createdAt).toLocaleDateString()}</div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(budget)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(budget._id)}
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
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No budgets found. {isAdmin && 'Create your first budget above.'}
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

export default Budgets;