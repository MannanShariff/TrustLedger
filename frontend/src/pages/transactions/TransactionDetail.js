import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const TransactionDetail = () => {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        const res = await axios.get(`/api/transactions/${id}`);
        setTransaction(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transaction details:', err);
        toast.error('Failed to fetch transaction details');
        setLoading(false);
      }
    };

    fetchTransactionDetails();
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
    return <div className="text-center py-10">Loading transaction details...</div>;
  }

  if (!transaction) {
    return <div className="text-center py-10 text-red-500">Transaction not found</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Transaction Details</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Transaction Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 font-medium">Description:</span>
                <span className="ml-2">{transaction.description}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Amount:</span>
                <span className="ml-2 font-semibold" style={{ color: transaction.type === 'expense' ? 'red' : 'green' }}>
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Type:</span>
                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.type === 'expense' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {transaction.type}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Date:</span>
                <span className="ml-2">{formatDate(transaction.date)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Related Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 font-medium">Project:</span>
                <span className="ml-2">
                  {transaction.projectId && transaction.projectId.name 
                    ? transaction.projectId.name 
                    : 'Not assigned'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Vendor:</span>
                <span className="ml-2">
                  {transaction.vendorId && transaction.vendorId.name 
                    ? transaction.vendorId.name 
                    : 'Not assigned'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Created By:</span>
                <span className="ml-2">
                  {transaction.createdBy && transaction.createdBy.name 
                    ? transaction.createdBy.name 
                    : 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Last Updated:</span>
                <span className="ml-2">
                  {transaction.updatedAt 
                    ? formatDate(transaction.updatedAt) 
                    : formatDate(transaction.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {transaction.receiptUrl && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Receipt</h2>
          <div className="flex justify-center">
            <img 
              src={transaction.receiptUrl} 
              alt="Transaction Receipt" 
              className="max-w-full h-auto max-h-96 rounded-md shadow-sm"
            />
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Notes</h2>
        <p className="text-gray-700">
          {transaction.notes || 'No additional notes for this transaction.'}
        </p>
      </div>
    </div>
  );
};

export default TransactionDetail;