import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

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
      
      // Refresh budgets list
      const res = await axios.get('/api/budgets');
      setBudgets(res.data);
    } catch (err) {
      console.error('Error saving budget:', err);
      toast.error('Failed to save budget');
    }
  };

  // Handle edit button click
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

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await axios.delete(`/api/budgets/${id}`);
        toast.success('Budget deleted successfully');
        
        // Remove deleted budget from state
        setBudgets(budgets.filter(budget => budget._id !== id));
      } catch (err) {
        console.error('Error deleting budget:', err);
        toast.error('Failed to delete budget');
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Budget Management</h1>
      
      {isAdmin && (
        <div className="bg-white shadow-md rounded-lg p-6">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount*</label>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
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
                {editMode ? 'Update Budget' : 'Create Budget'}
              </button>
              
              {editMode && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: '',
                      description: '',
                      fiscalYear: new Date().getFullYear(),
                      totalAmount: ''
                    });
                    setEditMode(false);
                    setCurrentBudgetId(null);
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
          <h2 className="text-xl font-semibold mb-4">Budget List</h2>
          
          {loading ? (
            <p className="text-gray-500">Loading budgets...</p>
          ) : budgets.length === 0 ? (
            <p className="text-gray-500">No budgets found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiscal Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {budgets.map((budget) => (
                    <tr key={budget._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{budget.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{budget.fiscalYear}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatCurrency(budget.totalAmount)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs">{budget.description || '-'}</div>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(budget)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
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

export default Budgets;