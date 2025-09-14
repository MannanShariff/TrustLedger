import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const [projectRes, transactionsRes] = await Promise.all([
          axios.get(`/api/projects/${id}`),
          axios.get(`/api/transactions/project/${id}`)
        ]);
        
        setProject(projectRes.data);
        setTransactions(transactionsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project details:', err);
        toast.error('Failed to fetch project details');
        setLoading(false);
      }
    };

    fetchProjectDetails();
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
    return <div className="text-center py-10">Loading project details...</div>;
  }

  if (!project) {
    return <div className="text-center py-10 text-red-500">Project not found</div>;
  }

  // Calculate total spent
  const totalSpent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const remainingBudget = project.allocatedAmount - totalSpent;
  const spentPercentage = (totalSpent / project.allocatedAmount) * 100;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">{project.name} - Project Details</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Project Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="ml-2">{project.name}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Department:</span>
                <span className="ml-2">
                  {project.departmentId && project.departmentId.name 
                    ? project.departmentId.name 
                    : 'Unknown Department'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Allocated Amount:</span>
                <span className="ml-2">{formatCurrency(project.allocatedAmount)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Status:</span>
                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-800' : project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' : project.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                  {project.status}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Description:</span>
                <p className="mt-1 text-gray-700">{project.description || 'No description provided.'}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Budget Utilization</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 font-medium">Total Spent:</span>
                <span className="ml-2">{formatCurrency(totalSpent)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Remaining Budget:</span>
                <span className="ml-2 font-semibold" style={{ color: remainingBudget < 0 ? 'red' : 'green' }}>
                  {formatCurrency(remainingBudget)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Utilization Percentage:</span>
                <span className="ml-2">{spentPercentage.toFixed(2)}%</span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
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
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Transactions</h2>
          
          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions found for this project.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
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

export default ProjectDetail;