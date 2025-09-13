import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const DepartmentDetail = () => {
  const { id } = useParams();
  const [department, setDepartment] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartmentDetails = async () => {
      try {
        const [departmentRes, projectsRes] = await Promise.all([
          axios.get(`/api/departments/${id}`),
          axios.get(`/api/projects/department/${id}`)
        ]);
        
        setDepartment(departmentRes.data);
        setProjects(projectsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching department details:', err);
        toast.error('Failed to fetch department details');
        setLoading(false);
      }
    };

    fetchDepartmentDetails();
  }, [id]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return <div className="text-center py-10">Loading department details...</div>;
  }

  if (!department) {
    return <div className="text-center py-10 text-red-500">Department not found</div>;
  }

  // Calculate total allocated to projects
  const totalAllocatedToProjects = projects.reduce((sum, project) => sum + project.allocatedAmount, 0);
  const remainingAmount = department.allocatedAmount - totalAllocatedToProjects;
  const allocationPercentage = (totalAllocatedToProjects / department.allocatedAmount) * 100;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">{department.name} - Department Details</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Department Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="ml-2">{department.name}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Budget:</span>
                <span className="ml-2">
                  {department.budgetId && department.budgetId.name 
                    ? department.budgetId.name 
                    : 'Unknown Budget'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Allocated Amount:</span>
                <span className="ml-2">{formatCurrency(department.allocatedAmount)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Description:</span>
                <p className="mt-1 text-gray-700">{department.description || 'No description provided.'}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Project Allocation</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 font-medium">Total Allocated to Projects:</span>
                <span className="ml-2">{formatCurrency(totalAllocatedToProjects)}</span>
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
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          
          {projects.length === 0 ? (
            <p className="text-gray-500">No projects have been allocated to this department.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage of Department Budget</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project) => {
                    const projectPercentage = (project.allocatedAmount / department.allocatedAmount) * 100;
                    return (
                      <tr key={project._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatCurrency(project.allocatedAmount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-800' : project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{projectPercentage.toFixed(2)}%</div>
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

export default DepartmentDetail;