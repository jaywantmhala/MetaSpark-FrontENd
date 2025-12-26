const API_BASE_URL = 'http://localhost:8080/machine';

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

// Add a new machine
export const addMachine = async (machineData) => {
  const response = await fetch(`${API_BASE_URL}/add-machine`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify({
      machineName: machineData.name,
      status: machineData.status,
      dateAdded: machineData.dateAdded
    }),
  });
  return handleResponse(response);
};

// Get all machines
export const getAllMachines = async () => {
  const response = await fetch(`${API_BASE_URL}/getAllMachines`, {
    method: 'GET',
    headers: createHeaders(),
  });
  return handleResponse(response);
};

// Update a machine
export const updateMachine = async (id, machineData) => {
  const response = await fetch(`${API_BASE_URL}/update-machine/${id}`, {
    method: 'PUT',
    headers: createHeaders(),
    body: JSON.stringify({
      machineName: machineData.name,
      status: machineData.status,
      dateAdded: machineData.dateAdded,
    }),
  });
  return handleResponse(response);
};

// Delete a machine
export const deleteMachine = async (id) => {
  const response = await fetch(`${API_BASE_URL}/delete-machine/${id}`, {
    method: 'DELETE',
    headers: createHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to delete machine');
  }
};