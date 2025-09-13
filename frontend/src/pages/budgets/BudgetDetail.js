import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const BudgetDetail = () => {
  const { id } = useParams();
  const [budget, setBudget] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetDetails = async () => {
      try {
        const [budgetRes, departmentsRes] = await Promise.all([
          axios.get(`/api/budgets/${id}`),
          axios.get(`/api/departments/budget/${id}`)
        ]);
        
        setBudget(budgetRes.data);
        setDepartments(departmentsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching budget details:', err);
        toast.error('Failed to fetch budget details');
        setLoading(false);
      }
    };

    fetchBudgetDetails();
  }, [id]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return <div className="text-center py-10">Loading budget details...</div>;
  }

  if (!budget) {
    return <div className="text-center py-10 text-red-500">Budget not found</div>;
  }

  // Calculate total allocated amount
  const totalAllocated = departments.reduce((sum, dept) => sum + dept.allocatedAmount, 0);
  const remainingAmount = budget.totalAmount - totalAllocated;
  const allocationPercentage = (totalAllocated / budget.totalAmount) * 100;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">{budget.name} - Budget Details</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Budget Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="ml-2">{budget.name}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Fiscal Year:</span>
                <span className="ml-2">{budget.fiscalYear}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Total Amount:</span>
                <span className="ml-2">{formatCurrency(budget.totalAmount)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Description:</span>
                <p className="mt-1 text-gray-700">{budget.description || 'No description provided.'}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Budget Allocation</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 font-medium">Total Allocated:</span>
                <span className="ml-2">{formatCurrency(totalAllocated)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Remaining:</span>
                <span className="ml-2 font-semibold" style={{ color: remainingAmount < 0 ? 'red' : 'green' }}>
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Allocation Percentage:</span>
                <span className="ml-2">{allocationPercentage.toFixed(2)}%</span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${allocationPercentage > 100 ? 'bg-red-600' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(allocationPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Department Allocations</h2>
          
          {departments.length === 0 ? (
            <p className="text-gray-500">No departments have been allocated to this budget.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage of Budget</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departments.map((department) => {
                    const deptPercentage = (department.allocatedAmount / budget.totalAmount) * 100;
                    return (
                      <tr key={department._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{department.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatCurrency(department.allocatedAmount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{deptPercentage.toFixed(2)}%</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetDetail;