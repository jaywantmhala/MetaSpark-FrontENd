'use client'

import { useState, useEffect } from 'react';
import { FiEye, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import Sidebar from '@/components/Sidebar';
import * as customerApi from './api';

export default function CustomersPage() {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    companyName: '',
    email: '',
    customerNumber: '',
    gstNumber: '',
    phoneNumber: '',
    primaryAddress: '',
    useAsBilling: true,
    useAsShipping: true,
  });

  // Fetch customers when component mounts
  useEffect(() => {
    fetchCustomers();
  }, []);

  const parseBackendDate = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return new Date(`${month}-${day}-${year}`);
    }
    return new Date(dateString);
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerApi.getAllCustomers();
      // Map backend response to frontend format
      const mappedCustomers = response.map(customer => ({
        id: `CUST-${customer.customerId}`,
        customerId: customer.customerId,
        customerName: customer.customerName,
        companyName: customer.companyName || '',
        email: customer.customerEmail,
        customerNumber: `CUST-${customer.customerId}`,
        gstNumber: customer.gstNumber || '',
        phoneNumber: customer.customerPhone || '',
        primaryAddress: customer.primaryAddress || '',
        useAsBilling: true,
        useAsShipping: true,
        status: customer.status || 'Active',
        date: customer.dateAdded ? parseBackendDate(customer.dateAdded).toLocaleDateString('en-US', { 
            month: 'short', 
            day: '2-digit', 
            year: 'numeric' 
          }) : new Date().toLocaleDateString('en-US', { 
            month: 'short', 
            day: '2-digit', 
            year: 'numeric' 
          })
      }));
      setCustomers(mappedCustomers);
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.dropdown-container')) {
        setMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const saveCustomer = async () => {
    try {
      // Validate required fields
      if (!form.customerName.trim()) {
        toast.error('Customer name is required');
        return;
      }
      
      if (editingId) {
        // Update existing customer
        const customerId = editingId.split('-')[1]; // Extract ID from CUST-ID format
        await customerApi.updateCustomer(parseInt(customerId), form);
        toast.success('Customer updated successfully');
        // Refresh the customer list
        await fetchCustomers();
      } else {
        // Create new customer
        await customerApi.createCustomer(form);
        toast.success('Customer created successfully');
        // Refresh the customer list
        await fetchCustomers();
      }
      
      setShowModal(false);
      setEditingId(null);
      setForm({
        customerName: '',
        companyName: '',
        email: '',
        customerNumber: '',
        gstNumber: '',
        phoneNumber: '',
        primaryAddress: '',
        useAsBilling: true,
        useAsShipping: true,
      });
    } catch (err) {
      console.error('Error saving customer:', err);
      toast.error(`Error saving customer: ${err.message}`);
    }
  };

  const handleEdit = (customer) => {
    setForm({
      customerName: customer.customerName,
      companyName: customer.companyName || '',
      email: customer.email,
      customerNumber: customer.id,
      gstNumber: customer.gstNumber || '',
      phoneNumber: customer.phoneNumber || '',
      primaryAddress: customer.primaryAddress || '',
      useAsBilling: customer.useAsBilling !== false,
      useAsShipping: customer.useAsShipping !== false,
    });
    setEditingId(customer.id);
    setShowModal(true);
  };

  const handleView = (customer) => {
    setViewingCustomer(customer);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    // Show SweetAlert confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const customerId = id.split('-')[1]; // Extract ID from CUST-ID format
        await customerApi.deleteCustomer(parseInt(customerId));
        Swal.fire(
          'Deleted!',
          'Customer has been deleted.',
          'success'
        );
        // Refresh the customer list
        await fetchCustomers();
      } catch (err) {
        console.error('Error deleting customer:', err);
        Swal.fire(
          'Error!',
          `Error deleting customer: ${err.message}`,
          'error'
        );
      }
    }
  };

  const handleExcelUpload = async (event) => {
    setIsUploading(true);
    try {
      const file = event.target.files[0];
      await customerApi.uploadCustomersExcel(file);
      toast.success('Customers uploaded successfully');
      await fetchCustomers();
    } catch (err) {
      console.error('Error uploading customers:', err);
      toast.error(`Error uploading customers: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3">Loading customers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page content - layout is handled by ClientLayout */}
      <div className="p-6">
        <Toaster />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-black">Customer Management</h1>
            <p className="text-xs sm:text-sm text-black/70">View, manage, and add new customers.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-end">
            <label className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium px-4 py-2 rounded-md cursor-pointer w-full sm:w-auto">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleExcelUpload}
                disabled={isUploading}
              />
              {isUploading ? 'Uploading…' : 'Upload Excel'}
            </label>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-md w-full sm:w-auto"
            >
              <span>＋</span> Add Customer
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchCustomers}
              className="mt-2 text-sm text-red-700 underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-black bg-gray-50">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Company</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Phone</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">GST No</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date Added</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, i) => (
                    <tr key={customer.id} className={i % 2 ? 'bg-gray-50' : ''}>
                      <td className="py-3 px-4 text-indigo-600 font-medium">{customer.id}</td>
                      <td className="py-3 px-4 text-black font-medium">{customer.customerName}</td>
                      <td className="py-3 px-4 text-black hidden lg:table-cell">{customer.companyName || '-'}</td>
                      <td className="py-3 px-4 text-black hidden xl:table-cell">{customer.phoneNumber || '-'}</td>
                      <td className="py-3 px-4 text-black hidden xl:table-cell">{customer.gstNumber || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${customer.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-black hidden lg:table-cell whitespace-nowrap">{customer.date}</td>
                      <td className="py-3 px-4 text-black">
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            className="p-1 text-blue-600 hover:text-blue-800"
                            onClick={(e) => { 
                              e.stopPropagation();
                              handleView(customer); 
                            }}
                            aria-label="View"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            type="button"
                            className="p-1 text-green-600 hover:text-green-800"
                            onClick={(e) => { 
                              e.stopPropagation();
                              handleEdit(customer); 
                            }}
                            aria-label="Edit"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            type="button"
                            className="p-1 text-red-600 hover:text-red-800"
                            onClick={(e) => { 
                              e.stopPropagation();
                              handleDelete(customer.id); 
                            }}
                            aria-label="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile List View */}
            <div className="md:hidden mt-4 space-y-3 p-4">
              {customers.map((customer) => (
                <div key={customer.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-black">{customer.customerName}</h3>
                      <p className="text-sm text-indigo-600">{customer.id}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${customer.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                      {customer.status}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    {customer.companyName && <p>Company: {customer.companyName}</p>}
                    {customer.phoneNumber && <p>Phone: {customer.phoneNumber}</p>}
                    <p className="text-xs text-gray-500">Added: {customer.date}</p>
                  </div>
                  
                  <div className="mt-3 flex justify-end space-x-2">
                    <button
                      onClick={() => handleView(customer)}
                      className="text-sm px-3 py-1 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 flex items-center gap-1"
                    >
                      <FiEye size={16} />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleEdit(customer)}
                      className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center gap-1"
                    >
                      <FiEdit size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 flex items-center gap-1"
                    >
                      <FiTrash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => { setShowModal(false); setEditingId(null); setForm({ customerName: '', companyName: '', email: '', customerNumber: '', gstNumber: '', phoneNumber: '', primaryAddress: '', useAsBilling: true, useAsShipping: true }); }}
            />
            <div className="absolute inset-0 flex items-start md:items-center justify-center p-2 sm:p-4 overflow-y-auto">
              <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl border border-gray-200 my-4">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-black">{editingId ? 'Edit Customer' : 'Add New Customer'}</h3>
                    <p className="text-sm text-black/70">Enter the customer details below.</p>
                  </div>
                  <button 
                    onClick={() => { setShowModal(false); setEditingId(null); setForm({ customerName: '', companyName: '', email: '', customerNumber: '', gstNumber: '', phoneNumber: '', primaryAddress: '', useAsBilling: true, useAsShipping: true }); }} 
                    className="text-black hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Customer Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={form.customerName}
                        onChange={(e) => setForm({...form, customerName: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        placeholder="Enter customer name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Company Name</label>
                      <input 
                        type="text" 
                        value={form.companyName}
                        onChange={(e) => setForm({...form, companyName: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Email Address</label>
                      <input 
                        type="email" 
                        value={form.email}
                        onChange={(e) => setForm({...form, email: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Customer Number</label>
                      <input 
                        type="text" 
                        value={form.customerNumber}
                        onChange={(e) => setForm({...form, customerNumber: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        placeholder="Enter customer number"
                        readOnly={!!editingId}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">GST Number</label>
                      <input 
                        type="text" 
                        value={form.gstNumber}
                        onChange={(e) => setForm({...form, gstNumber: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        placeholder="Enter GST number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Phone Number</label>
                      <input 
                        type="tel" 
                        value={form.phoneNumber}
                        onChange={(e) => setForm({...form, phoneNumber: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1 text-black">Primary Address</label>
                      <textarea
                        value={form.primaryAddress}
                        onChange={(e) => setForm({...form, primaryAddress: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        placeholder="Enter primary address"
                        rows="3"
                      />
                    </div>
                    <div className="md:col-span-2 flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={form.useAsBilling}
                          onChange={(e) => setForm({...form, useAsBilling: e.target.checked})}
                          className="form-checkbox h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Use as Billing Address</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={form.useAsShipping}
                          onChange={(e) => setForm({...form, useAsShipping: e.target.checked})}
                          className="form-checkbox h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Use as Shipping Address</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => { setShowModal(false); setEditingId(null); setForm({ customerName: '', companyName: '', email: '', customerNumber: '', gstNumber: '', phoneNumber: '', primaryAddress: '', useAsBilling: true, useAsShipping: true }); }}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={saveCustomer}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    {editingId ? 'Update' : 'Save'} Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        )}

        {showViewModal && viewingCustomer && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => { setShowViewModal(false); setViewingCustomer(null); }}
            />
            <div className="absolute inset-0 flex items-start md:items-center justify-center p-2 sm:p-4 overflow-y-auto">
              <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl border border-gray-200 my-4">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-black">Customer Details</h3>
                    <p className="text-sm text-black/70">View the customer details below.</p>
                  </div>
                  <button 
                    onClick={() => { setShowViewModal(false); setViewingCustomer(null); }} 
                    className="text-black hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Customer Name</label>
                      <input 
                        type="text" 
                        value={viewingCustomer.customerName}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Company Name</label>
                      <input 
                        type="text" 
                        value={viewingCustomer.companyName || ''}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Email Address</label>
                      <input 
                        type="email" 
                        value={viewingCustomer.email}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Customer Number</label>
                      <input 
                        type="text" 
                        value={viewingCustomer.customerNumber}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">GST Number</label>
                      <input 
                        type="text" 
                        value={viewingCustomer.gstNumber || ''}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Phone Number</label>
                      <input 
                        type="tel" 
                        value={viewingCustomer.phoneNumber || ''}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        readOnly
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1 text-black">Primary Address</label>
                      <textarea
                        value={viewingCustomer.primaryAddress || ''}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                        readOnly
                        rows="3"
                      />
                    </div>
                    <div className="md:col-span-2 flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={viewingCustomer.useAsBilling}
                          className="form-checkbox h-4 w-4 text-indigo-600"
                          readOnly
                        />
                        <span className="ml-2 text-sm text-gray-700">Use as Billing Address</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={viewingCustomer.useAsShipping}
                          className="form-checkbox h-4 w-4 text-indigo-600"
                          readOnly
                        />
                        <span className="ml-2 text-sm text-gray-700">Use as Shipping Address</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => { setShowViewModal(false); setViewingCustomer(null); }}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        )}
      </div>
    </div>
  );
}