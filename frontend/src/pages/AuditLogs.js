import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

const AuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
    userId: ''
  });
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });
  
  const { user } = useContext(AuthContext);
  const isAuditor = user && (user.role === 'auditor' || user.role === 'admin');

  // Fetch audit logs
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        // Build query parameters
        const params = { page: pagination.page, limit: pagination.limit };
        if (filters.action) params.action = filters.action;
        if (filters.entityType) params.entityType = filters.entityType;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        if (filters.userId) params.userId = filters.userId;

        const res = await axios.get('/api/audit', { params });
        setAuditLogs(res.data.logs);
        setPagination({
          ...pagination,
          total: res.data.total
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
        toast.error('Failed to fetch audit logs');
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users');
        setUsers(res.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchAuditLogs();
    fetchUsers();
  }, [pagination.page, pagination.limit]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Apply filters
  const applyFilters = () => {
    setPagination({ ...pagination, page: 1 }); // Reset to first page
    fetchAuditLogs();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      action: '',
      entityType: '',
      startDate: '',
      endDate: '',
      userId: ''
    });
    setPagination({ ...pagination, page: 1 });
    fetchAuditLogs();
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(pagination.total / pagination.limit)) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get user name by ID
  const getUserName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? `${user.name} (${user.role})` : 'Unknown User';
  };

  // Format action for display
  const formatAction = (action) => {
    return action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format entity type for display
  const formatEntityType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Fetch audit logs with current filters and pagination
  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = { page: pagination.page, limit: pagination.limit };
      if (filters.action) params.action = filters.action;
      if (filters.entityType) params.entityType = filters.entityType;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.userId) params.userId = filters.userId;

      const res = await axios.get('/api/audit', { params });
      setAuditLogs(res.data.logs);
      setPagination({
        ...pagination,
        total: res.data.total
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      toast.error('Failed to fetch audit logs');
      setLoading(false);
    }
  };

  if (!isAuditor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Access Denied!</strong>
          <span className="block sm:inline"> You do not have permission to view audit logs.</span>
        </div>
      </div>
    );
  }

  if (loading && auditLogs.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Audit Logs</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter Audit Logs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="file_upload">File Upload</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
            <select
              name="entityType"
              value={filters.entityType}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="">All Entities</option>
              <option value="user">User</option>
              <option value="budget">Budget</option>
              <option value="department">Department</option>
              <option value="project">Project</option>
              <option value="vendor">Vendor</option>
              <option value="transaction">Transaction</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <select
              name="userId"
              value={filters.userId}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(log.timestamp)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getUserName(log.userId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.action === 'create' ? 'bg-green-100 text-green-800' :
                        log.action === 'update' ? 'bg-blue-100 text-blue-800' :
                        log.action === 'delete' ? 'bg-red-100 text-red-800' :
                        log.action === 'login' ? 'bg-purple-100 text-purple-800' :
                        log.action === 'logout' ? 'bg-gray-100 text-gray-800' :
                        log.action === 'file_upload' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatEntityType(log.entityType)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{log.entityId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{log.ipAddress}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {log.details ? (
                          <details>
                            <summary className="cursor-pointer text-indigo-600 hover:text-indigo-900">View Details</summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          '-'
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No audit logs found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{auditLogs.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-3 py-1 rounded-md ${
                pagination.page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className={`px-3 py-1 rounded-md ${
                pagination.page >= Math.ceil(pagination.total / pagination.limit)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;