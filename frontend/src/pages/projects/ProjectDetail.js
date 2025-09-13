import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { FaArrowLeft, FaEdit, FaTrash, FaDownload, FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CSVLink } from 'react-csv';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user, isAdmin } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const [projectRes, transactionsRes] = await Promise.all([
          axios.get(`/api/projects/${id}`),
          axios.get(`/api/transactions/project/${id}`)
        ]);
        
        setProject(projectRes.data);
        setTransactions(transactionsRes.data);
        setFilteredTransactions(transactionsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Failed to fetch project details');
        toast.error('Failed to fetch project details');
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...transactions];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(transaction => 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.vendorId && transaction.vendorId.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply date range filter
    if (dateRange.startDate) {
      const startDate = new Date(dateRange.startDate);
      result = result.filter(transaction => new Date(transaction.date) >= startDate);
    }
    
    if (dateRange.endDate) {
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // End of the day
      result = result.filter(transaction => new Date(transaction.date) <= endDate);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue, bValue;
        
        if (sortConfig.key === 'vendor') {
          aValue = a.vendorId ? a.vendorId.name.toLowerCase() : '';
          bValue = b.vendorId ? b.vendorId.name.toLowerCase() : '';
        } else if (sortConfig.key === 'date') {
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
        } else if (sortConfig.key === 'amount') {
          aValue = a.amount;
          bValue = b.amount;
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
          
          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredTransactions(result);
  }, [transactions, searchTerm, dateRange, sortConfig]);

  // Handle delete project
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This will NOT delete associated transactions.')) {
      try {
        await axios.delete(`/api/projects/${id}`);
        toast.success('Project deleted successfully');
        // Redirect to projects list
        window.location.href = '/projects';
      } catch (err) {
        console.error('Error deleting project:', err);
        toast.error(err.response?.data?.message || 'Failed to delete project');
      }
    }
  };
  
  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  // Handle date filter change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page on new filter
  };
  
  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setDateRange({ startDate: '', endDate: '' });
    setSortConfig({ key: 'date', direction: 'desc' });
    setCurrentPage(1);
  };
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  
  // Prepare CSV data for export
  const prepareCSVData = () => {
    return filteredTransactions.map(transaction => ({
      Date: formatDate(transaction.date),
      Description: transaction.description,
      Vendor: transaction.vendorId ? transaction.vendorId.name : 'Unknown',
      Amount: formatCurrency(transaction.amount),
      Type: transaction.type
    }));
  };
  
  // Prepare chart data
  const prepareExpensesByVendorData = () => {
    const vendorMap = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense' && transaction.vendorId) {
        const vendorName = transaction.vendorId.name || 'Unknown';
        if (!vendorMap[vendorName]) {
          vendorMap[vendorName] = 0;
        }
        vendorMap[vendorName] += transaction.amount;
      }
    });
    
    return Object.entries(vendorMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 vendors
  };
  
  const prepareMonthlyExpensesData = () => {
    const monthlyData = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          name: monthName,
          expenses: 0,
          income: 0
        };
      }
      
      if (transaction.type === 'expense') {
        monthlyData[monthYear].expenses += transaction.amount;
      } else {
        monthlyData[monthYear].income += transaction.amount;
      }
    });
    
    return Object.values(monthlyData).sort((a, b) => {
      const dateA = new Date(a.name);
      const dateB = new Date(b.name);
      return dateA - dateB;
    });
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

  if (loading) {
    return <div className="text-center py-10">Loading project details...</div>;
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500">{error}</div>
        <Link to="/projects" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-10">
        <div className="text-gray-500">Project not found</div>
        <Link to="/projects" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  // Calculate budget metrics
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalSpent = totalExpenses - totalIncome;
  const remainingBudget = project.allocatedAmount - totalSpent;
  const spentPercentage = (totalSpent / project.allocatedAmount) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/projects" className="text-blue-500 hover:text-blue-700 flex items-center">
          <FaArrowLeft className="mr-2" /> Back to Projects
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          
          {(isAdmin || user.role === 'finance') && (
            <div className="flex space-x-2">
              <Link 
                to={`/projects/edit/${project._id}`} 
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
              >
                <FaEdit className="mr-2" /> Edit
              </Link>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
              >
                <FaTrash className="mr-2" /> Delete
              </button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Project Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{project.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">
                    {project.departmentId && project.departmentId.name 
                      ? project.departmentId.name 
                      : 'Unknown Department'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-800' : project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' : project.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {project.status}
                    </span>
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{project.description || 'No description provided.'}</p>
                </div>
                
                {project.startDate && (
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{formatDate(project.startDate)}</p>
                  </div>
                )}
                
                {project.endDate && (
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">{formatDate(project.endDate)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Budget Utilization</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Allocated Budget</p>
                  <p className="font-medium text-lg">{formatCurrency(project.allocatedAmount)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Total Expenses</p>
                  <p className="font-medium text-red-600">{formatCurrency(totalExpenses)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Total Income</p>
                  <p className="font-medium text-green-600">{formatCurrency(totalIncome)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Net Spent</p>
                  <p className="font-medium">{formatCurrency(totalSpent)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Remaining Budget</p>
                  <p className="font-medium text-lg" style={{ color: remainingBudget < 0 ? 'red' : 'green' }}>
                    {formatCurrency(remainingBudget)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Budget Utilization ({spentPercentage.toFixed(2)}%)</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className={`h-2.5 rounded-full ${spentPercentage > 100 ? 'bg-red-600' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts Section */}
        {transactions.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expenses by Vendor */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Top Expenses by Vendor</h2>
              <div className="bg-gray-50 p-4 rounded-lg" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prepareExpensesByVendorData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {prepareExpensesByVendorData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Monthly Expenses */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Monthly Expenses & Income</h2>
              <div className="bg-gray-50 p-4 rounded-lg" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareMonthlyExpensesData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="expenses" name="Expenses" fill="#FF8042" />
                    <Bar dataKey="income" name="Income" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mt-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Transactions</h2>
            
            <div className="flex space-x-2">
              {filteredTransactions.length > 0 && (
                <CSVLink 
                  data={prepareCSVData()} 
                  filename={`${project.name}-transactions.csv`}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                >
                  <FaDownload className="mr-2" /> Export CSV
                </CSVLink>
              )}
              
              <button 
                onClick={resetFilters}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
              >
                <FaFilter className="mr-2" /> Reset Filters
              </button>
            </div>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="border rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Start Date"
              />
            </div>
            
            <div>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="border rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="End Date"
              />
            </div>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {transactions.length === 0 
                  ? 'No transactions found for this project.' 
                  : 'No transactions match your search criteria.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center">
                          Date
                          {sortConfig.key === 'date' && (
                            sortConfig.direction === 'asc' 
                              ? <FaSortAmountUp className="ml-1" /> 
                              : <FaSortAmountDown className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('description')}
                      >
                        <div className="flex items-center">
                          Description
                          {sortConfig.key === 'description' && (
                            sortConfig.direction === 'asc' 
                              ? <FaSortAmountUp className="ml-1" /> 
                              : <FaSortAmountDown className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('vendor')}
                      >
                        <div className="flex items-center">
                          Vendor
                          {sortConfig.key === 'vendor' && (
                            sortConfig.direction === 'asc' 
                              ? <FaSortAmountUp className="ml-1" /> 
                              : <FaSortAmountDown className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center">
                          Amount
                          {sortConfig.key === 'amount' && (
                            sortConfig.direction === 'asc' 
                              ? <FaSortAmountUp className="ml-1" /> 
                              : <FaSortAmountDown className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('type')}
                      >
                        <div className="flex items-center">
                          Type
                          {sortConfig.key === 'type' && (
                            sortConfig.direction === 'asc' 
                              ? <FaSortAmountUp className="ml-1" /> 
                              : <FaSortAmountDown className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTransactions.map((transaction) => (
                      <tr key={transaction._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(transaction.date)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{transaction.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {transaction.vendorId && transaction.vendorId.name 
                              ? transaction.vendorId.name 
                              : 'Unknown Vendor'}
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/transactions/${transaction._id}`} className="text-blue-600 hover:text-blue-900">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <div>
                    <span className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">
                        {Math.min(indexOfLastItem, filteredTransactions.length)}
                      </span> of <span className="font-medium">{filteredTransactions.length}</span> results
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                      Previous
                    </button>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;