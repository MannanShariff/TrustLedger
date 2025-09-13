import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

const Audit = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    userId: '',
    startDate: '',
    endDate: ''
  });
  const [users, setUsers] = useState([]);
  
  const { user, isAdmin } = useContext(AuthContext);

  useEffect(() => {
    // Only admins and auditors should be able to access this page
    if (!isAdmin && user.role !== 'auditor') {
      toast.error('You do not have permission to access this page');
      return;
    }
    
    fetchData();
  }, [isAdmin, user.role]);

  const fetchData = async () => {
    try {
      const [logsRes, usersRes] = await Promise.all([
        axios.get('/api/audit'),
        axios.get('/api/users')
      ]);
      
      setAuditLogs(logsRes.data);
      setUsers(usersRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      toast.error('Failed to fetch audit logs');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = () => {
    let url = '/api/audit?';
    const queryParams = [];
    
    if (filters.action) queryParams.push(`action=${filters.action}`);
    if (filters.entity) queryParams.push(`entity=${filters.entity}`);
    if (filters.userId) queryParams.push(`userId=${filters.userId}`);
    if (filters.startDate) queryParams.push(`startDate=${filters.startDate}`);
    if (filters.endDate) queryParams.push(`endDate=${filters.endDate}`);
    
    url += queryParams.join('&');
    
    setLoading(true);
    axios.get(url)
      .then(res => {
        setAuditLogs(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error applying filters:', err);
        toast.error('Failed to apply filters');
        setLoading(false);
      });
  };

  const resetFilters = () => {
    setFilters({
      action: '',
      entity: '',
      userId: '',
      startDate: '',
      endDate: ''
    });
    fetchData();
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-10">Loading audit logs...</div>;
  }

  // If user is not admin or auditor, show access denied
  if (!isAdmin && user.role !== 'auditor') {
    return (
      <div className="text-center py-10 text-red-500">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2">You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Audit Logs</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Filter Audit Logs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Action</label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Entity</label>
            <select
              name="entity"
              value={filters.entity}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700">User</label>
            <select
              name="userId"
              value={filters.userId}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end space-x-3">
            <button
              onClick={applyFilters}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(log.timestamp)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {log.userId && typeof log.userId === 'object' 
                          ? `${log.userId.name} (${log.userId.email})` 
                          : 'Unknown User'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.action === 'create' ? 'bg-green-100 text-green-800' :
                        log.action === 'update' ? 'bg-blue-100 text-blue-800' :
                        log.action === 'delete' ? 'bg-red-100 text-red-800' :
                        log.action === 'login' ? 'bg-purple-100 text-purple-800' :
                        log.action === 'logout' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{log.entity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {log.entityId ? log.entityId.substring(0, 8) + '...' : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{log.ipAddress || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {log.details ? (
                          <details>
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View Details</summary>
                            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Audit;