'use client';

import { useState, useEffect } from 'react';
import { FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';
import { addMachine, getAllMachines, updateMachine, deleteMachine } from './api.js'; // Import API functions

const StatusBadge = ({ status }) => {
  const statusStyles = {
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusStyles[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full mr-2 ${
          status === 'Active' ? 'bg-green-500' : 'bg-red-500'
        }`}
      ></span>
      {status}
    </span>
  );
};

export default function MachinesPage() {
  const [openMenu, setOpenMenu] = useState(null);
  const [showAddMachineModal, setShowAddMachineModal] = useState(false);
  const [showViewMachineModal, setShowViewMachineModal] = useState(false);
  const [showEditMachineModal, setShowEditMachineModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    status: 'Active',
    dateAdded: new Date().toISOString().split('T')[0],
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    status: 'Active',
  });
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [machines, setMachines] = useState([]); // State for machines data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch machines data on component mount
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        setLoading(true);
        const data = await getAllMachines();
        setMachines(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching machines:', err);
        setError('Failed to load machines');
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newMachine = await addMachine(formData);
      // Add the new machine to the list
      setMachines((prev) => [...prev, newMachine]);
      setShowAddMachineModal(false);
      // Reset form
      setFormData({
        name: '',
        status: 'Active',
        dateAdded: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Error adding machine:', err);
      alert('Failed to add machine: ' + err.message);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedMachine) return;

    try {
      const updated = await updateMachine(selectedMachine.id, {
        name: editFormData.name,
        status: editFormData.status,
        dateAdded: selectedMachine.dateAdded,
      });

      setMachines((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );

      setShowEditMachineModal(false);
      setSelectedMachine(null);
    } catch (err) {
      console.error('Error updating machine:', err);
      alert('Failed to update machine: ' + err.message);
    }
  };

  const handleDeleteMachine = async (machine) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete machine "${machine.machineName}"?`
    );

    if (!confirmDelete) return;

    try {
      await deleteMachine(machine.id);
      setMachines((prev) => prev.filter((m) => m.id !== machine.id));
    } catch (err) {
      console.error('Error deleting machine:', err);
      alert('Failed to delete machine: ' + err.message);
    }
  };

  const toggleMenu = (id) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenu && !event.target.closest('.menu-container')) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-lg">Loading machines...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Machine Management
            </h1>
            <p className="text-gray-600 mt-1">
              View, manage, and add new machines to the workshop.
            </p>
          </div>
          <button
            onClick={() => setShowAddMachineModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors mt-4 md:mt-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Add Machine</span>
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Machine Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Added
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {machines.map((machine) => (
                  <tr key={machine.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {machine.machineName}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={machine.status} />
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {machine.dateAdded}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          className="p-1 text-blue-600 hover:text-blue-800"
                          onClick={(e) => { 
                            e.stopPropagation();
                            setSelectedMachine(machine);
                            setShowViewMachineModal(true);
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
                            setSelectedMachine(machine);
                            setEditFormData({
                              name: machine.machineName,
                              status: machine.status,
                            });
                            setShowEditMachineModal(true);
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
                            handleDeleteMachine(machine);
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
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 mt-4">
          {machines.map((machine) => (
            <div
              key={`mobile-${machine.id}`}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {machine.machineName}
                  </h3>
                  <div className="mt-1">
                    <StatusBadge status={machine.status} />
                  </div>
                </div>
                <div className="relative menu-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(`mobile-${machine.id}`);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1 -mr-2"
                    aria-label="Actions"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>

                  {openMenu === `mobile-${machine.id}` && (
                    <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1" role="menu">
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setSelectedMachine(machine);
                            setShowViewMachineModal(true);
                            setOpenMenu(null);
                          }}
                        >
                          <FiEye size={16} className="mr-2" />
                          View Details
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setSelectedMachine(machine);
                            setEditFormData({
                              name: machine.machineName,
                              status: machine.status,
                            });
                            setShowEditMachineModal(true);
                            setOpenMenu(null);
                          }}
                        >
                          <FiEdit size={16} className="mr-2" />
                          Edit
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          onClick={() => {
                            handleDeleteMachine(machine);
                            setOpenMenu(null);
                          }}
                        >
                          <FiTrash2 size={16} className="mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <div>Added: {machine.dateAdded}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Machine Modal */}
      {showAddMachineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* light blurred background */}
          <div
            className="absolute inset-0 bg-black/10 backdrop-blur-sm"
            onClick={() => setShowAddMachineModal(false)}
          />
          {/* modal */}
          <div
            className="relative bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Add New Machine
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the details for the new machine
                  </p>
                </div>
                <button
                  onClick={() => setShowAddMachineModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Machine Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMachineModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Machine Modal */}
      {showViewMachineModal && selectedMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/10 backdrop-blur-sm"
            onClick={() => {
              setShowViewMachineModal(false);
              setSelectedMachine(null);
            }}
          />
          <div
            className="relative bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Machine Details</h3>
              </div>
              <button
                onClick={() => {
                  setShowViewMachineModal(false);
                  setSelectedMachine(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm text-gray-700">
              <div>
                <span className="font-medium">Machine Name: </span>
                <span>{selectedMachine.machineName}</span>
              </div>
              <div>
                <span className="font-medium">Status: </span>
                <StatusBadge status={selectedMachine.status} />
              </div>
              <div>
                <span className="font-medium">Date Added: </span>
                <span>{selectedMachine.dateAdded}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Machine Modal */}
      {showEditMachineModal && selectedMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/10 backdrop-blur-sm"
            onClick={() => {
              setShowEditMachineModal(false);
              setSelectedMachine(null);
            }}
          />
          <div
            className="relative bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Edit Machine</h3>
              </div>
              <button
                onClick={() => {
                  setShowEditMachineModal(false);
                  setSelectedMachine(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Machine Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Added
                </label>
                <input
                  type="text"
                  value={selectedMachine.dateAdded}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditMachineModal(false);
                    setSelectedMachine(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}