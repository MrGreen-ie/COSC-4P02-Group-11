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


/**
 * Generate AI summary of content
 * @param {string} content - The content to summarize (can be null if url is provided)
 * @param {number} length - The desired summary length (percentage of original)
 * @param {string} tone - The tone of the summary (professional, casual, etc.)
 * @param {boolean} isHtml - Whether the content contains HTML
 * @param {string} url - URL to extract content from (optional)
 * @param {boolean} strictFiltering - Whether to use strict content filtering
 * @param {function} onProgress - Callback for progress updates (optional)
 * @returns {Promise<Object>} - The summary response
 */
export const generateSummary = async (content, length = 50, tone = 'professional', isHtml = false, url = '', strictFiltering = false, onProgress = null) => {
  try {
    const payload = {
      length,
      tone,
      strict_filtering: strictFiltering
    };
    
    // Add content or URL based on what's provided
    if (content) {
      payload.content = content;
      payload.is_html = isHtml;
    } else if (url) {
      payload.url = url;
    }
    
    const response = await api.post('/api/summarize', payload);
    
    // Check if this is an asynchronous task
    if (response.data.status === 'processing' && response.data.task_id) {
      // If we have a progress callback, start polling
      if (onProgress) {
        onProgress({
          status: 'processing',
          progress: 0,
          message: 'Starting summary generation...'
        });
      }
      
      // Poll for results
      return pollForResults(response.data.task_id, onProgress);
    }
    
    return response.data;
  } catch (error) {
    console.error('Summary generation failed:', error);
    throw error.response?.data || { error: error.message };
  }
};

/**
 * Poll for asynchronous task results
 * @param {string} taskId - The task ID to poll for
 * @param {function} onProgress - Callback for progress updates (optional)
 * @param {number} interval - Polling interval in milliseconds
 * @param {number} timeout - Maximum polling time in milliseconds
 * @returns {Promise<Object>} - The task result
 */
export const pollForResults = async (taskId, onProgress = null, interval = 1000, timeout = 300000) => {
  const startTime = Date.now();
  let progress = 0;
  
  // Define a polling function
  const poll = async () => {
    try {
      const response = await api.get(`/api/summarize/status/${taskId}`);
      
      // If task is still processing
      if (response.data.status === 'processing') {
        // Calculate progress based on elapsed time (simple estimation)
        const elapsed = Date.now() - startTime;
        progress = Math.min(95, Math.floor((elapsed / timeout) * 100));
        
        // Call progress callback if provided
        if (onProgress) {
          onProgress({
            status: 'processing',
            progress,
            message: response.data.message || 'Processing...'
          });
        }
        
        // Check if we've exceeded the timeout
        if (elapsed > timeout) {
          throw new Error('Task timed out');
        }
        
        // Wait for the next polling interval
        await new Promise(resolve => setTimeout(resolve, interval));
        
        // Poll again
        return poll();
      }
      
      // If task completed successfully
      if (response.data.summary) {
        // Call progress callback with 100%
        if (onProgress) {
          onProgress({
            status: 'completed',
            progress: 100,
            message: 'Summary generation complete'
          });
        }
        
        return response.data;
      }
      
      // If there was an error
      throw new Error(response.data.error || 'Unknown error');
      
    } catch (error) {
      console.error('Polling error:', error);
      
      // Call progress callback with error
      if (onProgress) {
        onProgress({
          status: 'error',
          progress: 0,
          message: error.message || 'Failed to generate summary'
        });
      }
      
      throw error;
    }
  };
  
  // Start polling
  return poll();
};

/**
 * Generate summaries for a batch of content items
 * @param {Array} items - Array of content items to summarize
 * @param {number} length - The desired summary length (percentage of original)
 * @param {string} tone - The tone of the summary (professional, casual, etc.)
 * @param {function} onProgress - Callback for progress updates (optional)
 * @returns {Promise<Object>} - The batch processing results
 */
export const generateBatchSummaries = async (items, length = 50, tone = 'professional', onProgress = null) => {
  try {
    // Prepare payload
    const payload = {
      items: items.map(item => ({
        id: item.id,
        content: item.content,
        url: item.url,
        is_html: item.isHtml,
        strict_filtering: item.strictFiltering
      })),
      length,
      tone
    };
    
    // Call batch endpoint
    const response = await api.post('/api/summarize/batch', payload);
    
    // If we have a progress callback, start tracking batch progress
    if (onProgress) {
      onProgress({
        status: 'processing',
        progress: 0,
        message: `Started batch processing for ${items.length} items`,
        completedItems: 0,
        totalItems: items.length
      });
      
      // Start tracking progress for each task
      trackBatchProgress(response.data.tasks, onProgress);
    }
    
    return response.data;
  } catch (error) {
    console.error('Batch summary generation failed:', error);
    throw error.response?.data || { error: error.message };
  }
};

/**
 * Track progress of a batch of tasks
 * @param {Array} tasks - Array of task objects with task_id
 * @param {function} onProgress - Callback for progress updates
 */
const trackBatchProgress = async (tasks, onProgress) => {
  // Filter out tasks with errors
  const validTasks = tasks.filter(task => task.status !== 'error');
  const totalTasks = validTasks.length;
  let completedTasks = 0;
  
  // Create a map to track completion status
  const taskStatus = new Map();
  validTasks.forEach(task => {
    taskStatus.set(task.task_id, false);
  });
  
  // Poll for each task
  const pollPromises = validTasks.map(async (task) => {
    try {
      // Poll for this task's results
      await pollForResults(
        task.task_id,
        (progress) => {
          // If task completed
          if (progress.status === 'completed' && !taskStatus.get(task.task_id)) {
            taskStatus.set(task.task_id, true);
            completedTasks++;
            
            // Update overall progress
            onProgress({
              status: 'processing',
              progress: Math.floor((completedTasks / totalTasks) * 100),
              message: `Completed ${completedTasks} of ${totalTasks} items`,
              completedItems: completedTasks,
              totalItems: totalTasks
            });
            
            // Check if all tasks are complete
            if (completedTasks === totalTasks) {
              onProgress({
                status: 'completed',
                progress: 100,
                message: `All ${totalTasks} items processed successfully`,
                completedItems: totalTasks,
                totalItems: totalTasks
              });
            }
          }
        }
      );
    } catch (error) {
      console.error(`Error polling task ${task.task_id}:`, error);
    }
  });
  
  // Wait for all polling to complete
  await Promise.all(pollPromises);
};

/**
 * Save a generated summary to the database
 * @param {string} headline - The headline of the summary
 * @param {string} summary - The summary content
 * @param {string} tags - Comma-separated list of tags
 * @param {string} tone - The tone used for the summary
 * @param {number} length - The length percentage used
 * @returns {Promise<Object>} - The response with the saved summary ID
 */
export const saveSummary = async (headline, summary, tags, tone, length) => {
  try {
    const response = await api.post('/api/summary/save', {
      headline,
      summary,
      tags,
      tone,
      length
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to save summary:', error);
    throw error.response?.data || { error: error.message };
  }
};

/**
 * Get all saved summaries for the current user
 * @returns {Promise<Object>} - The response with the list of saved summaries
 */
export const getSavedSummaries = async () => {
  try {
    const response = await api.get('/api/summary/saved');
    return response.data;
  } catch (error) {
    console.error('Failed to get saved summaries:', error);
    throw error.response?.data || { error: error.message };
  }
};

/**
 * Toggle favorite status for a summary
 * @param {number} summaryId - The ID of the summary to toggle favorite status
 * @returns {Promise<Object>} - The response with the updated favorite status
 */
export const toggleFavorite = async (summaryId) => {
  try {
    const response = await api.post('/api/summary/toggle-favorite', {
      summary_id: summaryId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to toggle favorite status:', error);
    throw error.response?.data || { error: error.message };
  }
};

/**
 * Get all favorite summaries for the current user
 * @returns {Promise<Object>} - The response with the list of favorite summaries
 */
export const getFavoriteSummaries = async () => {
  try {
    const response = await api.get('/api/summary/favorites');
    return response.data;
  } catch (error) {
    console.error('Failed to get favorite summaries:', error);
    throw error.response?.data || { error: error.message };
  }
};

/**
 * Check if a summary is favorited by the current user
 * @param {number} summaryId - The ID of the summary to check
 * @returns {Promise<Object>} - The response with the favorite status
 */
export const checkFavoriteStatus = async (summaryId) => {
  try {
    const response = await api.get(`/api/summary/check-favorite/${summaryId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to check favorite status:', error);
    throw error.response?.data || { error: error.message };
  }
};

/**
 * Search for news articles by category from TheNewsAPI
 * @param {Array} categories - Array of category names (limit 2)
 * @returns {Promise<Object>} - Articles response
 */
export const searchNewsArticles = async (categories) => {
  try {
    const response = await api.post('/api/news/search', { categories });
    return response.data;
  } catch (error) {
    console.error('News article search failed:', error);
    throw error.response?.data || { error: error.message };
  }
};

/**
 * Toggle favorite status for an article
 * @param {Object} article - The article object to favorite/unfavorite
 * @returns {Promise<Object>} - The response with updated favorite status
 */
export const toggleArticleFavorite = async (article) => {
  try {
    const response = await api.post('/api/news/favorite', { article });
    return response.data;
  } catch (error) {
    console.error('Toggle article favorite failed:', error);
    throw error.response?.data || { error: error.message };
  }
};

/**
 * Get all favorited articles for the current user
 * @returns {Promise<Object>} - The favorited articles response
 */
export const getFavoriteArticles = async () => {
  try {
    const response = await api.get('/api/news/favorites');
    return response.data;
  } catch (error) {
    console.error('Get favorite articles failed:', error);
    throw error.response?.data || { error: error.message };
  }
};
