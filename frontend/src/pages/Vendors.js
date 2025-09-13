import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxId: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [currentVendorId, setCurrentVendorId] = useState(null);
  
  const { user } = useContext(AuthContext);
  const isAdmin = user && user.role === 'admin';
  const isProjectManager = user && (user.role === 'project_manager' || user.role === 'department_head' || user.role === 'admin');

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await axios.get('/api/vendors');
        setVendors(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching vendors:', err);
        toast.error('Failed to fetch vendors');
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editMode) {
        // Update existing vendor
        await axios.put(`/api/vendors/${currentVendorId}`, formData);
        toast.success('Vendor updated successfully');
      } else {
        // Create new vendor
        await axios.post('/api/vendors', formData);
        toast.success('Vendor created successfully');
      }

      // Reset form and fetch updated vendors
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        taxId: ''
      });
      setEditMode(false);
      setCurrentVendorId(null);

      // Fetch updated vendors
      const res = await axios.get('/api/vendors');
      setVendors(res.data);
    } catch (err) {
      console.error('Error saving vendor:', err);
      toast.error(err.response?.data?.message || 'Failed to save vendor');
    }
  };

  // Handle edit vendor
  const handleEdit = (vendor) => {
    setFormData({
      name: vendor.name,
      contactPerson: vendor.contactPerson || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      taxId: vendor.taxId || ''
    });
    setEditMode(true);
    setCurrentVendorId(vendor._id);
  };

  // Handle delete vendor
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor? This may affect associated transactions.')) {
      try {
        await axios.delete(`/api/vendors/${id}`);
        toast.success('Vendor deleted successfully');
        setVendors(vendors.filter(vendor => vendor._id !== id));
      } catch (err) {
        console.error('Error deleting vendor:', err);
        toast.error(err.response?.data?.message || 'Failed to delete vendor');
      }
    }
  };

  // Cancel edit mode
  const handleCancel = () => {
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      taxId: ''
    });
    setEditMode(false);
    setCurrentVendorId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Vendor Management</h1>
      
      {isProjectManager && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{editMode ? 'Edit Vendor' : 'Create New Vendor'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone*</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  rows="2"
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-2">
              {editMode && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {editMode ? 'Update Vendor' : 'Create Vendor'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                {isProjectManager && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.length > 0 ? (
                vendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{vendor.contactPerson || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{vendor.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{vendor.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{vendor.taxId || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{vendor.address || '-'}</div>
                    </td>
                    {isProjectManager && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(vendor)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(vendor._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isProjectManager ? 7 : 6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No vendors found. {isProjectManager && 'Create your first vendor above.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Vendors;