import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const VendorDetail = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        const [vendorRes, transactionsRes] = await Promise.all([
          axios.get(`/api/vendors/${id}`),
          axios.get(`/api/transactions/vendor/${id}`)
        ]);
        
        setVendor(vendorRes.data);
        setTransactions(transactionsRes.data);
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

  if (loading) {
    return <div className="text-center py-10">Loading vendor details...</div>;
  }

  if (!vendor) {
    return <div className="text-center py-10 text-red-500">Vendor not found</div>;
  }

  // Calculate total transactions
  const totalTransactions = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">{vendor.name} - Vendor Details</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Vendor Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="ml-2">{vendor.name}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Contact Person:</span>
                <span className="ml-2">{vendor.contactPerson || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Email:</span>
                <span className="ml-2">{vendor.email || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Phone:</span>
                <span className="ml-2">{vendor.phone || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Category:</span>
                <span className="ml-2">{vendor.category || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Address:</span>
                <p className="mt-1 text-gray-700">{vendor.address || 'No address provided.'}</p>
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
                <span className="ml-2 font-semibold">{formatCurrency(totalTransactions)}</span>
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
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Transactions</h2>
          
          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions found for this vendor.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
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
                        <div className="text-sm font-medium" style={{ color: transaction.type === 'expense' ? 'red' : 'green' }}>
                          {formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.type === 'expense' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {transaction.type}
                        </span>
                      </td>
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

export default VendorDetail;