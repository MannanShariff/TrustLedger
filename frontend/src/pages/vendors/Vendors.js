import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaEdit, FaTrash, FaSearch, FaFilter, FaSort } from 'react-icons/fa';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    gstin: '',
    email: '',
    phone: '',
    address: '',
    description: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [currentVendorId, setCurrentVendorId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  const { user, isAdmin } = useContext(AuthContext);

  useEffect(() => {
    fetchVendors();
  }, []);
  
  useEffect(() => {
    // Filter and sort vendors whenever vendors, searchTerm, or sort parameters change
    let result = [...vendors];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(vendor => 
        vendor.name.toLowerCase().includes(search) ||
        (vendor.contactInfo?.email && vendor.contactInfo.email.toLowerCase().includes(search)) ||
        (vendor.description && vendor.description.toLowerCase().includes(search))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue;
      
      // Handle nested fields
      if (sortField === 'email') {
        aValue = a.contactInfo?.email || '';
        bValue = b.contactInfo?.email || '';
      } else if (sortField === 'phone') {
        aValue = a.contactInfo?.phone || '';
      } else {
        aValue = a[sortField] || '';
        bValue = b[sortField] || '';
      }
      
      // Compare values based on sort direction
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
    
    setFilteredVendors(result);
  }, [vendors, searchTerm, sortField, sortDirection]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  const handleSort = (field) => {
    // If clicking the same field, toggle direction, otherwise set new field with 'asc'
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name) {
      toast.error('Vendor name is required');
      return;
    }

    // Format data for API
    const vendorData = {
      name: formData.name,
      gstin: formData.gstin,
      contactInfo: {
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      },
      description: formData.description
    };

    try {
      if (editMode) {
        await axios.put(`/api/vendors/${currentVendorId}`, vendorData);
        toast.success('Vendor updated successfully');
      } else {
        await axios.post('/api/vendors', vendorData);
        toast.success('Vendor added successfully');
      }
      
      // Reset form and fetch updated vendors
      setFormData({
        name: '',
        gstin: '',
        email: '',
        phone: '',
        address: '',
        description: ''
      });
      setEditMode(false);
      setCurrentVendorId(null);
      fetchVendors();
    } catch (err) {
      console.error('Error saving vendor:', err);
      toast.error(err.response?.data?.message || 'Failed to save vendor');
    }
  };

  const handleEdit = (vendor) => {
    setFormData({
      name: vendor.name,
      gstin: vendor.gstin || '',
      email: vendor.contactInfo?.email || '',
      phone: vendor.contactInfo?.phone || '',
      address: vendor.contactInfo?.address || '',
      description: vendor.description || ''
    });
    setEditMode(true);
    setCurrentVendorId(vendor._id);
  };
  
  const handleReset = () => {
    setFormData({
      name: '',
      gstin: '',
      email: '',
      phone: '',
      address: '',
      description: ''
    });
    setEditMode(false);
    setCurrentVendorId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await axios.delete(`/api/vendors/${id}`);
        toast.success('Vendor deleted successfully');
        fetchVendors();
      } catch (err) {
        console.error('Error deleting vendor:', err);
        toast.error(err.response?.data?.message || 'Failed to delete vendor');
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      gstin: '',
      email: '',
      phone: '',
      address: '',
      description: ''
    });
    setEditMode(false);
    setCurrentVendorId(null);
  };

  if (loading) {
    return <div className="text-center py-10">Loading vendors...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Vendors Management</h1>
      
      {isAdmin && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{editMode ? 'Edit Vendor' : 'Add New Vendor'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gstin">
                  GSTIN
                </label>
                <input
                  type="text"
                  id="gstin"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                  Phone
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="mb-4 md:col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="mb-4 md:col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <div className="flex items-center justify-end mt-4 space-x-4">
              {editMode && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {editMode ? 'Update Vendor' : 'Add Vendor'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-semibold mb-4 md:mb-0">Vendors List</h2>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="shadow appearance-none border rounded w-full md:w-64 py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No vendors found. {isAdmin && 'Add a new vendor to get started.'}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th 
                      className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        <span>Name</span>
                        {sortField === 'name' && (
                          <FaSort className="ml-1 text-gray-500" />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left">GSTIN</th>
                    <th 
                      className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center">
                        <span>Email</span>
                        {sortField === 'email' && (
                          <FaSort className="ml-1 text-gray-500" />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left">Phone</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((vendor) => (
                    <tr key={vendor._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Link to={`/vendors/${vendor._id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                          {vendor.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{vendor.gstin || '-'}</td>
                      <td className="py-3 px-4">{vendor.contactInfo?.email || '-'}</td>
                      <td className="py-3 px-4">{vendor.contactInfo?.phone || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Link to={`/vendors/${vendor._id}`} className="text-blue-600 hover:text-blue-800">
                            View
                          </Link>
                          
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleEdit(vendor)}
                                className="text-yellow-600 hover:text-yellow-800 ml-2"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(vendor._id)}
                                className="text-red-600 hover:text-red-800 ml-2"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
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
          </>
        )}
      </div>
    </div>
  );
};

export default Vendors;