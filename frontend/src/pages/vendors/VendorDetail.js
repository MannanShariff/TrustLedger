import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaFilter, FaDownload, FaSearch } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const VendorDetail = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        const [vendorRes, transactionsRes] = await Promise.all([
          axios.get(`/api/vendors/${id}`),
          axios.get(`/api/transactions/vendor/${id}`)
        ]);
        
        setVendor(vendorRes.data);
        setTransactions(transactionsRes.data);
        setFilteredTransactions(transactionsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching vendor details:', err);
        toast.error('Failed to fetch vendor details');
        setLoading(false);
      }
    };

    fetchVendorDetails();
  }, [id]);

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
        (transaction.projectId?.name && transaction.projectId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        transaction.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply date range filter
    if (dateRange.start) {
      result = result.filter(transaction => new Date(transaction.date) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      result = result.filter(transaction => new Date(transaction.date) <= new Date(dateRange.end));
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
          const aName = a.projectId?.name || '';
          const bName = b.projectId?.name || '';
          return sortConfig.direction === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
        }
        return 0;
      });
    }
    
    setFilteredTransactions(result);
  }, [transactions, searchTerm, dateRange, sortConfig]);
  
  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  // Handle date filter change
  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
    setCurrentPage(1);
  };
  
  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setSortConfig({ key: 'date', direction: 'desc' });
    setCurrentPage(1);
  };
  
  // Export transactions as CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Project', 'Amount', 'Invoice Number', 'Status'];
    const csvData = filteredTransactions.map(t => [
      formatDate(t.date),
      t.description,
      t.projectId?.name || 'Not assigned',
      t.amount,
      t.invoiceNumber || 'N/A',
      t.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${vendor.name}_transactions.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Prepare chart data
  const prepareChartData = () => {
    // Group transactions by month
    const monthlyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = { name: monthYear, amount: 0, count: 0 };
      }
      
      acc[monthYear].amount += transaction.amount;
      acc[monthYear].count += 1;
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    return Object.values(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.name.split(' ');
      const [bMonth, bYear] = b.name.split(' ');
      const aDate = new Date(`${aMonth} 1, ${aYear}`);
      const bDate = new Date(`${bMonth} 1, ${bYear}`);
      return aDate - bDate;
    });
  };
  
  // Calculate total transactions
  const totalTransactionsAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  // Conditional rendering moved to return statement
  if (loading) {
    return <div className="text-center py-10">Loading vendor details...</div>;
  }

  if (!vendor) {
    return <div className="text-center py-10 text-red-500">Vendor not found</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link to="/vendors" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
          <FaArrowLeft className="mr-2" /> Back to Vendors
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">{vendor.name} - Vendor Details</h1>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Vendor Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="ml-2">{vendor.name}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">GSTIN:</span>
                <span className="ml-2">{vendor.gstin || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Email:</span>
                <span className="ml-2">{vendor.contactInfo?.email || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Phone:</span>
                <span className="ml-2">{vendor.contactInfo?.phone || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Address:</span>
                <p className="mt-1 text-gray-700">{vendor.contactInfo?.address || 'No address provided.'}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Description:</span>
                <p className="mt-1 text-gray-700">{vendor.description || 'No description provided.'}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Transaction Summary</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 font-medium">Total Transactions:</span>
                <span className="ml-2">{transactions.length}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Total Amount:</span>
                <span className="ml-2 font-semibold">{formatCurrency(totalTransactionsAmount)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">First Transaction:</span>
                <span className="ml-2">
                  {transactions.length > 0 
                    ? formatDate(transactions.sort((a, b) => new Date(a.date) - new Date(b.date))[0].date)
                    : 'No transactions'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Latest Transaction:</span>
                <span className="ml-2">
                  {transactions.length > 0 
                    ? formatDate(transactions.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date)
                    : 'No transactions'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transaction Chart */}
      {transactions.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prepareChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="amount" name="Transaction Amount" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="count" name="Transaction Count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-semibold mb-4 md:mb-0">Transactions</h2>
            
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
              
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  name="start"
                  value={dateRange.start}
                  onChange={handleDateChange}
                  className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <span>to</span>
                <input
                  type="date"
                  name="end"
                  value={dateRange.end}
                  onChange={handleDateChange}
                  className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <button
                onClick={resetFilters}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
              >
                <FaFilter className="mr-2" /> Reset
              </button>
              
              <button
                onClick={exportToCSV}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
              >
                <FaDownload className="mr-2" /> Export
              </button>
            </div>
          </div>
          
          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions found for this vendor.</p>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-gray-500">No transactions match your search criteria.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('date')}
                    >
                      Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('project')}
                    >
                      Project {sortConfig.key === 'project' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('amount')}
                    >
                      Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((transaction) => (
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
                            : 'Not assigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/transactions/${transaction._id}`} className="text-blue-600 hover:text-blue-900">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
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

export default VendorDetail;