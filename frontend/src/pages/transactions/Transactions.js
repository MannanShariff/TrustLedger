import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { FaEdit, FaTrash, FaSearch, FaFilter, FaSort, FaDownload, FaEye } from 'react-icons/fa';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    projectId: '',
    vendorId: '',
    type: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    projectId: '',
    vendorId: '',
    receiptImage: null
  });
  const [editMode, setEditMode] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  
  const { user, isAdmin } = useContext(AuthContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transactionsRes, projectsRes, vendorsRes] = await Promise.all([
        axios.get('/api/transactions'),
        axios.get('/api/projects'),
        axios.get('/api/vendors')
      ]);
      
      setTransactions(transactionsRes.data);
      setFilteredTransactions(transactionsRes.data);
      setProjects(projectsRes.data);
      setVendors(vendorsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to fetch data');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'receiptImage' && files && files[0]) {
      // Handle file upload
      setFormData({ ...formData, receiptImage: files[0] });
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.description || !formData.amount || !formData.date) {
      toast.error('Description, amount, and date are required');
      return;
    }

    try {
      const data = new FormData();
      
      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'receiptImage') {
          if (formData.receiptImage) {
            data.append('receiptImage', formData.receiptImage);
          }
        } else {
          data.append(key, formData[key]);
        }
      });

      if (editMode) {
        await axios.put(`/api/transactions/${currentTransactionId}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Transaction updated successfully');
      } else {
        await axios.post('/api/transactions', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Transaction added successfully');
      }
      
      // Reset form and fetch updated transactions
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error saving transaction:', err);
      toast.error(err.response?.data?.message || 'Failed to save transaction');
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      projectId: '',
      vendorId: '',
      receiptImage: null
    });
    setEditMode(false);
    setCurrentTransactionId(null);
    setFilePreview(null);
  };

  const handleEdit = async (transaction) => {
    // Fetch the full transaction details including receipt URL if available
    try {
      const res = await axios.get(`/api/transactions/${transaction._id}`);
      const transactionData = res.data;
      
      setFormData({
        description: transactionData.description,
        amount: transactionData.amount.toString(),
        date: new Date(transactionData.date).toISOString().split('T')[0],
        type: transactionData.type,
        projectId: transactionData.projectId?._id || '',
        vendorId: transactionData.vendorId?._id || '',
        receiptImage: null // We don't set the file here, just keep the reference
      });
      
      // If there's a receipt, set the preview
      if (transactionData.receiptUrl) {
        setFilePreview(transactionData.receiptUrl);
      } else {
        setFilePreview(null);
      }
      
      setEditMode(true);
      setCurrentTransactionId(transaction._id);
    } catch (err) {
      console.error('Error fetching transaction details:', err);
      toast.error('Failed to fetch transaction details');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`/api/transactions/${id}`);
        toast.success('Transaction deleted successfully');
        fetchData();
      } catch (err) {
        console.error('Error deleting transaction:', err);
        toast.error(err.response?.data?.message || 'Failed to delete transaction');
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

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter and sort transactions
  useEffect(() => {
    let result = [...transactions];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(transaction => 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.projectId && transaction.projectId.name && transaction.projectId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (transaction.vendorId && transaction.vendorId.name && transaction.vendorId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (transaction.invoiceNumber && transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply filters
    if (filters.projectId) {
      result = result.filter(transaction => transaction.projectId && transaction.projectId._id === filters.projectId);
    }
    if (filters.vendorId) {
      result = result.filter(transaction => transaction.vendorId && transaction.vendorId._id === filters.vendorId);
    }
    if (filters.type) {
      result = result.filter(transaction => transaction.type === filters.type);
    }
    if (filters.status) {
      result = result.filter(transaction => transaction.status === filters.status);
    }
    if (filters.dateFrom) {
      result = result.filter(transaction => new Date(transaction.date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      result = result.filter(transaction => new Date(transaction.date) <= new Date(filters.dateTo));
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (sortConfig.key === 'date') {
          return sortConfig.direction === 'asc' 
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        }
        if (sortConfig.key === 'amount') {
          return sortConfig.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        }
        if (sortConfig.key === 'project') {
          const aName = a.projectId && a.projectId.name ? a.projectId.name : '';
          const bName = b.projectId && b.projectId.name ? b.projectId.name : '';
          return sortConfig.direction === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
        }
        if (sortConfig.key === 'vendor') {
          const aName = a.vendorId && a.vendorId.name ? a.vendorId.name : '';
          const bName = b.vendorId && b.vendorId.name ? b.vendorId.name : '';
          return sortConfig.direction === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
        }
        if (sortConfig.key === 'description') {
          return sortConfig.direction === 'asc' 
            ? a.description.localeCompare(b.description)
            : b.description.localeCompare(a.description);
        }
        return 0;
      });
    }
    
    setFilteredTransactions(result);
  }, [transactions, searchTerm, filters, sortConfig]);
  
  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };
  
  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      projectId: '',
      vendorId: '',
      type: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
    setSortConfig({ key: 'date', direction: 'desc' });
    setCurrentPage(1);
  };
  
  // Export transactions as CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Project', 'Vendor', 'Amount', 'Type', 'Status'];
    const csvData = filteredTransactions.map(t => [
      formatDate(t.date),
      t.description,
      t.projectId && t.projectId.name ? t.projectId.name : 'Not assigned',
      t.vendorId && t.vendorId.name ? t.vendorId.name : 'Not assigned',
      t.amount,
      t.type,
      t.status || 'pending'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  if (loading) {
    return <div className="text-center py-10">Loading transactions...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Transactions Management</h1>
      
      {(isAdmin || user.role === 'finance') && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{editMode ? 'Edit Transaction' : 'Add New Transaction'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Project</label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Vendor</label>
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Vendor</option>
                  {vendors.map(vendor => (
                    <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Receipt Image</label>
                <input
                  type="file"
                  name="receiptImage"
                  onChange={handleChange}
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                {filePreview && (
                  <div className="mt-2">
                    <img src={filePreview} alt="Receipt preview" className="h-32 object-contain" />
                    <button 
                      type="button" 
                      onClick={() => {
                        setFilePreview(null);
                        setFormData({...formData, receiptImage: null});
                      }}
                      className="mt-1 text-xs text-red-600 hover:text-red-800"
                    >
                      Remove image
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              {editMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {editMode ? 'Update Transaction' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-semibold mb-4 md:mb-0">Transactions List</h2>
          
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="shadow appearance-none border rounded py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
            </div>
            
            <button
              onClick={() => document.getElementById('filterPanel').classList.toggle('hidden')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
            >
              <FaFilter className="mr-2" /> Filters
            </button>
            
            <button
              onClick={exportToCSV}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
            >
              <FaDownload className="mr-2" /> Export
            </button>
          </div>
        </div>
        
        {/* Filter Panel */}
        <div id="filterPanel" className="hidden bg-gray-100 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                name="projectId"
                value={filters.projectId}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Projects</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>{project.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <select
                name="vendorId"
                value={filters.vendorId}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Vendors</option>
                {vendors.map(vendor => (
                  <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    <span>Date</span>
                    {sortConfig.key === 'date' && (
                      <FaSort className="ml-1 text-gray-500" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('description')}
                >
                  <div className="flex items-center">
                    <span>Description</span>
                    {sortConfig.key === 'description' && (
                      <FaSort className="ml-1 text-gray-500" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('project')}
                >
                  <div className="flex items-center">
                    <span>Project</span>
                    {sortConfig.key === 'project' && (
                      <FaSort className="ml-1 text-gray-500" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('vendor')}
                >
                  <div className="flex items-center">
                    <span>Vendor</span>
                    {sortConfig.key === 'vendor' && (
                      <FaSort className="ml-1 text-gray-500" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center">
                    <span>Amount</span>
                    {sortConfig.key === 'amount' && (
                      <FaSort className="ml-1 text-gray-500" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                currentItems.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(transaction.date)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{transaction.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {transaction.projectId && transaction.projectId.name 
                          ? transaction.projectId.name 
                          : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {transaction.vendorId && transaction.vendorId.name 
                          ? transaction.vendorId.name 
                          : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: transaction.type === 'expense' ? 'red' : 'green' }}>
                        {formatCurrency(transaction.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.type === 'expense' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.receiptUrl ? (
                        <a 
                          href={transaction.receiptUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    {(isAdmin || user.role === 'finance') && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/transactions/${transaction._id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                          <FaEye />
                        </Link>
                        {(isAdmin || user.role === 'finance') && (
                          <>
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="text-yellow-600 hover:text-yellow-900 mr-3"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(transaction._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`mx-1 px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}`}
                >
                  Previous
                </button>
                
                {[...Array(totalPages).keys()].map(number => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    className={`mx-1 px-3 py-1 rounded ${currentPage === number + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 hover:bg-gray-400'}`}
                  >
                    {number + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`mx-1 px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;