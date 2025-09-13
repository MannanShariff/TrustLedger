import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    projectId: '',
    vendorId: '',
    paymentMethod: 'bank_transfer',
    receiptFile: null,
    notes: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState(null);
  const [fileSelected, setFileSelected] = useState(false);
  
  const { user } = useContext(AuthContext);
  const isAdmin = user && user.role === 'admin';
  const isProjectManager = user && (user.role === 'project_manager' || user.role === 'department_head' || user.role === 'admin');

  // Fetch transactions, projects, and vendors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsRes, projectsRes, vendorsRes] = await Promise.all([
          axios.get('/api/transactions'),
          axios.get('/api/projects'),
          axios.get('/api/vendors')
        ]);
        setTransactions(transactionsRes.data);
        setProjects(projectsRes.data);
        setVendors(vendorsRes.data);
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
    if (e.target.name === 'receiptFile') {
      setFormData({ ...formData, receiptFile: e.target.files[0] });
      setFileSelected(true);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.description || !formData.amount || !formData.date || !formData.projectId || !formData.vendorId) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      // Create form data for file upload
      const submitData = new FormData();
      submitData.append('description', formData.description);
      submitData.append('amount', formData.amount);
      submitData.append('date', formData.date);
      submitData.append('projectId', formData.projectId);
      submitData.append('vendorId', formData.vendorId);
      submitData.append('paymentMethod', formData.paymentMethod);
      submitData.append('notes', formData.notes);
      
      if (formData.receiptFile) {
        submitData.append('receiptFile', formData.receiptFile);
      }

      if (editMode) {
        // Update existing transaction
        await axios.put(`/api/transactions/${currentTransactionId}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Transaction updated successfully');
      } else {
        // Create new transaction
        await axios.post('/api/transactions', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Transaction created successfully');
      }

      // Reset form and fetch updated transactions
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        projectId: '',
        vendorId: '',
        paymentMethod: 'bank_transfer',
        receiptFile: null,
        notes: ''
      });
      setFileSelected(false);
      setEditMode(false);
      setCurrentTransactionId(null);

      // Fetch updated transactions
      const res = await axios.get('/api/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error('Error saving transaction:', err);
      toast.error(err.response?.data?.message || 'Failed to save transaction');
    }
  };

  // Handle edit transaction
  const handleEdit = (transaction) => {
    setFormData({
      description: transaction.description,
      amount: transaction.amount,
      date: new Date(transaction.date).toISOString().split('T')[0],
      projectId: transaction.projectId,
      vendorId: transaction.vendorId,
      paymentMethod: transaction.paymentMethod,
      receiptFile: null, // Can't pre-fill file input
      notes: transaction.notes || ''
    });
    setEditMode(true);
    setCurrentTransactionId(transaction._id);
    setFileSelected(false);
  };

  // Handle delete transaction
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`/api/transactions/${id}`);
        toast.success('Transaction deleted successfully');
        setTransactions(transactions.filter(transaction => transaction._id !== id));
      } catch (err) {
        console.error('Error deleting transaction:', err);
        toast.error(err.response?.data?.message || 'Failed to delete transaction');
      }
    }
  };

  // Cancel edit mode
  const handleCancel = () => {
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      projectId: '',
      vendorId: '',
      paymentMethod: 'bank_transfer',
      receiptFile: null,
      notes: ''
    });
    setFileSelected(false);
    setEditMode(false);
    setCurrentTransactionId(null);
  };

  // Get project name by ID
  const getProjectName = (projectId) => {
    const project = projects.find(p => p._id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  // Get vendor name by ID
  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v._id === vendorId);
    return vendor ? vendor.name : 'Unknown Vendor';
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format payment method for display
  const formatPaymentMethod = (method) => {
    return method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
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
      <h1 className="text-3xl font-bold mb-6 text-primary">Transaction Management</h1>
      
      {isProjectManager && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{editMode ? 'Edit Transaction' : 'Create New Transaction'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)*</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date*</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project*</label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor*</label>
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="">Select Vendor</option>
                  {vendors.map(vendor => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method*</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="online_payment">Online Payment</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt File</label>
                <input
                  type="file"
                  name="receiptFile"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
                {editMode && !fileSelected && (
                  <p className="text-xs text-gray-500 mt-1">
                    {editMode ? 'Upload a new file to replace the existing receipt' : 'Upload a receipt file (PDF, JPG, PNG)'}
                  </p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
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
                {editMode ? 'Update Transaction' : 'Create Transaction'}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                {isProjectManager && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                      {transaction.notes && (
                        <div className="text-xs text-gray-500 mt-1">{transaction.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{transaction.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(transaction.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{getProjectName(transaction.projectId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{getVendorName(transaction.vendorId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatPaymentMethod(transaction.paymentMethod)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.receiptUrl ? (
                        <a
                          href={transaction.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Receipt
                        </a>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    {isProjectManager && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(transaction._id)}
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
                  <td colSpan={isProjectManager ? 8 : 7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No transactions found. {isProjectManager && 'Create your first transaction above.'}
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

export default Transactions;