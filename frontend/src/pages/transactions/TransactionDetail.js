import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { FaArrowLeft, FaDownload, FaEdit, FaTrash } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TransactionDetail = () => {
  const { id } = useParams();
  const { user, isAdmin } = useContext(AuthContext);
  const [transaction, setTransaction] = useState(null);
  const [relatedTransactions, setRelatedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/transactions/${id}`);
        setTransaction(res.data);
        
        // Fetch related transactions (same vendor or same project)
        if (res.data.vendorId || res.data.projectId) {
          const query = {};
          if (res.data.vendorId) query.vendorId = res.data.vendorId._id;
          if (res.data.projectId) query.projectId = res.data.projectId._id;
          
          const relatedRes = await axios.get('/api/transactions', { params: query });
          // Filter out the current transaction
          const filteredTransactions = relatedRes.data.filter(t => t._id !== id);
          setRelatedTransactions(filteredTransactions);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transaction details:', err);
        setError('Failed to fetch transaction details');
        toast.error('Failed to fetch transaction details');
        setLoading(false);
      }
    };
    
    fetchTransactionDetails();
  }, [id]);

  // Handle delete transaction
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`/api/transactions/${id}`);
        toast.success('Transaction deleted successfully');
        // Redirect to transactions list
        window.location.href = '/transactions';
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
  
  // Prepare chart data
  const prepareChartData = () => {
    if (!transaction || !relatedTransactions.length) return [];
    
    // Group transactions by month
    const groupedByMonth = {};
    
    // Add current transaction
    const currentDate = new Date(transaction.date);
    const currentMonth = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
    groupedByMonth[currentMonth] = {
      name: new Date(currentDate.getFullYear(), currentDate.getMonth()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      amount: transaction.amount
    };
    
    // Add related transactions
    relatedTransactions.forEach(t => {
      const date = new Date(t.date);
      const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!groupedByMonth[month]) {
        groupedByMonth[month] = {
          name: new Date(date.getFullYear(), date.getMonth()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          amount: 0
        };
      }
      
      groupedByMonth[month].amount += t.amount;
    });
    
    // Convert to array and sort by date
    return Object.values(groupedByMonth).sort((a, b) => {
      const dateA = new Date(a.name);
      const dateB = new Date(b.name);
      return dateA - dateB;
    });
  };

  if (loading) {
    return <div className="text-center py-10">Loading transaction details...</div>;
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500">{error}</div>
        <Link to="/transactions" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Transactions
        </Link>
      </div>
    );
  }
  
  if (!transaction) {
    return (
      <div className="text-center py-10">
        <div className="text-gray-500">Transaction not found</div>
        <Link to="/transactions" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Transactions
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/transactions" className="text-blue-500 hover:text-blue-700 flex items-center">
          <FaArrowLeft className="mr-2" /> Back to Transactions
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Transaction Details</h1>
          
          {(isAdmin || user.role === 'finance') && (
            <div className="flex space-x-2">
              <Link 
                to={`/transactions/edit/${transaction._id}`} 
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
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{transaction.description}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium text-lg" style={{ color: transaction.type === 'expense' ? 'red' : 'green' }}>
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.type === 'expense' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {transaction.type}
                    </span>
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(transaction.date)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {transaction.status || 'pending'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Related Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 gap-4">
                {transaction.projectId && (
                  <div>
                    <p className="text-sm text-gray-500">Project</p>
                    <Link to={`/projects/${transaction.projectId._id}`} className="font-medium text-blue-500 hover:text-blue-700">
                      {transaction.projectId.name}
                    </Link>
                  </div>
                )}
                
                {transaction.vendorId && (
                  <div>
                    <p className="text-sm text-gray-500">Vendor</p>
                    <Link to={`/vendors/${transaction.vendorId._id}`} className="font-medium text-blue-500 hover:text-blue-700">
                      {transaction.vendorId.name}
                    </Link>
                  </div>
                )}
                
                {transaction.createdBy && (
                  <div>
                    <p className="text-sm text-gray-500">Created By</p>
                    <p className="font-medium">{transaction.createdBy.name || 'Unknown'}</p>
                  </div>
                )}
                
                {transaction.receiptUrl && (
                  <div>
                    <p className="text-sm text-gray-500">Receipt</p>
                    <div className="mt-2">
                      <a 
                        href={transaction.receiptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                      >
                        <FaDownload className="mr-2" /> Download Receipt
                      </a>
                    </div>
                  </div>
                )}
                
                {transaction.createdAt && (
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium">{formatDate(transaction.createdAt)}</p>
                  </div>
                )}
                
                {transaction.updatedAt && transaction.updatedAt !== transaction.createdAt && (
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">{formatDate(transaction.updatedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {transaction.notes && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                {transaction.notes}
              </p>
            </div>
          </div>
        )}
        
        {transaction.receiptUrl && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Receipt</h2>
            <div className="bg-gray-50 p-4 rounded-lg flex justify-center">
              <img 
                src={transaction.receiptUrl} 
                alt="Transaction Receipt" 
                className="max-w-full h-auto max-h-96 rounded-md shadow-sm"
              />
            </div>
          </div>
        )}
        
        {/* Transaction History Chart */}
        {relatedTransactions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="amount" fill="#4f46e5" name="Transaction Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Related Transactions */}
        {relatedTransactions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Related Transactions</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {relatedTransactions.map((t) => (
                    <tr key={t._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(t.date)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{t.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium" style={{ color: t.type === 'expense' ? 'red' : 'green' }}>
                          {formatCurrency(t.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.type === 'expense' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.status === 'completed' ? 'bg-green-100 text-green-800' : t.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {t.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/transactions/${t._id}`} className="text-blue-600 hover:text-blue-900">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetail;