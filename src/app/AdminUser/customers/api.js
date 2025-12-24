const API_BASE_URL = 'http://localhost:8080/customer';

// Helper function to get auth token (if needed)
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('swiftflow-user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.token; // Adjust based on how token is stored
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }
  return null;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'An error occurred');
  }
  return response.json();
};

// Create headers with optional auth
const createHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Headers for file upload (no explicit Content-Type so browser sets boundary)
const createUploadHeaders = () => {
  const headers = {};
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Create a new customer
export const createCustomer = async (customerData) => {
  const response = await fetch(`${API_BASE_URL}/create`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify({
      customerName: customerData.customerName,
      companyName: customerData.companyName,
      customerEmail: customerData.email,
      customerPhone: customerData.phoneNumber,
      gstNumber: customerData.gstNumber,
      primaryAddress: customerData.primaryAddress,
      billingAddress: customerData.primaryAddress, // Using primary as billing by default
      shippingAddress: customerData.primaryAddress, // Using primary as shipping by default
      status: 'Active',
    }),
  });
  return handleResponse(response);
};

// Get all customers
export const getAllCustomers = async () => {
  const response = await fetch(`${API_BASE_URL}/all`, {
    method: 'GET',
    headers: createHeaders(),
  });
  return handleResponse(response);
};

// Get all customers and products list
export const getAllCustomersAndProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/all-list`, {
    method: 'GET',
    headers: createHeaders(),
  });
  return handleResponse(response);
};

// Get customer by ID
export const getCustomerById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/get/${id}`, {
    method: 'GET',
    headers: createHeaders(),
  });
  return handleResponse(response);
};

// Update customer
export const updateCustomer = async (id, customerData) => {
  const response = await fetch(`${API_BASE_URL}/update/${id}`, {
    method: 'PUT',
    headers: createHeaders(),
    body: JSON.stringify({
      customerName: customerData.customerName,
      companyName: customerData.companyName,
      customerEmail: customerData.email,
      customerPhone: customerData.phoneNumber,
      gstNumber: customerData.gstNumber,
      primaryAddress: customerData.primaryAddress,
      billingAddress: customerData.primaryAddress, // Using primary as billing by default
      shippingAddress: customerData.primaryAddress, // Using primary as shipping by default
      status: 'Active',
    }),
  });
  return handleResponse(response);
};

// Delete customer
export const deleteCustomer = async (id) => {
  const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
    method: 'DELETE',
    headers: createHeaders(),
  });
  return handleResponse(response);
};

// Upload customers from Excel
export const uploadCustomersExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload-excel`, {
    method: 'POST',
    headers: createUploadHeaders(),
    body: formData,
  });
  return handleResponse(response);
};