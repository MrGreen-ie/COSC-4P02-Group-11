import axios from 'axios';

// Base URL of the Flask server (ensure it matches your backend's running address)
const API_URL = 'http://localhost:5000';

// Create an Axios instance with default configurations
const api = axios.create({
  baseURL: API_URL, // Set the base URL for all API requests
  headers: {
    'Content-Type': 'application/json', // Specify that we're sending JSON data
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Add request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear authentication data on unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Sends a login request to the Flask backend.
 */
export const login = async (email, password) => {
  try {
    console.log('Sending login request...');
    const response = await api.post('/login', { email, password });
    console.log('Login response received:', response.data);
    
    const { user, token, message } = response.data;
    
    // Handle both token-based and session-based authentication
    if (user) {
      // Store user data
      localStorage.setItem('user', JSON.stringify(user));
      
      // If token is provided, store it
      if (token) {
        localStorage.setItem('token', token);
      }
      
      return { user, token, message };
    } else {
      throw new Error('Login response missing user data');
    }
  } catch (error) {
    console.error('Login request failed:', error);
    throw error.response?.data || { error: error.message };
  }
};

/**
 * Sends a registration request to the Flask backend.
 */
export const register = async (email, password, firstName, lastName) => {
  try {
    console.log('Sending registration request...');
    const response = await api.post('/sign-up', {
      email,
      password,
      firstName,
      lastName,
    });
    console.log('Registration response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration request failed:', error);
    // Ensure we're passing through the error message from the server
    if (error.response?.data) {
      throw error.response.data;
    }
    throw { error: error.message };
  }
};

/**
 * Check authentication status
 */
export const checkAuth = async () => {
  try {
    const response = await api.get('/api/check-auth');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    const response = await api.get('/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
};
