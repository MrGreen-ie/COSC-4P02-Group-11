import axios from 'axios';

// Base URL of the Flask server (ensure it matches your backend's running address)
const API_URL = 'http://localhost:5000';

// Create an Axios instance with default configurations
const api = axios.create({
  baseURL: API_URL, // Set the base URL for all API requests
  headers: {
    'Content-Type': 'application/json', // Specify that we're sending JSON data
  },
});

/**
 * Sends a login request to the Flask backend.
 * 
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} - The response data from the backend if successful.
 * @throws {object} - Error details if the request fails.
 */
export const login = async (email, password) => {
  try {
    // POST request to /login endpoint with email and password as payload
    const response = await api.post('/login', { email, password });
    return response.data; // Return the response data from the server
  } catch (error) {
    // If there's an error, throw the server's error response or a generic message
    throw error.response?.data || { error: error.message };
  }
};

/**
 * Sends a registration request to the Flask backend.
 * 
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @returns {Promise<object>} - The response data from the backend if successful.
 * @throws {object} - Error details if the request fails.
 */
export const register = async (email, password, firstName, lastName) => {
  try {
    // POST request to /sign-up endpoint with user details as payload
    const response = await api.post('/sign-up', {
      email,
      password,
      firstName,
      lastName,
    });
    return response.data; // Return the response data from the server
  } catch (error) {
    // If there's an error, throw the server's error response or a generic message
    throw error.response?.data || { error: error.message };
  }
};
