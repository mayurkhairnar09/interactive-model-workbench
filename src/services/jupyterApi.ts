import axios from 'axios';

// Configuration
const JUPYTER_BASE_URL = 'http://localhost:8000';
const JUPYTER_USERNAME = 'admin'; // Default admin username
let JUPYTER_TOKEN = ''; // Will be set by the user

// Set token from environment or user input
export const setJupyterToken = (token: string) => {
  JUPYTER_TOKEN = token;
};

// Create axios instance with default config
const jupyterApi = axios.create({
  baseURL: JUPYTER_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
jupyterApi.interceptors.request.use((config) => {
  if (JUPYTER_TOKEN) {
    config.params = { ...config.params, token: JUPYTER_TOKEN };
  }
  return config;
});

// API Endpoints

/**
 * Create a new notebook
 */
export const createNotebook = async (notebookName: string) => {
  try {
    const response = await jupyterApi.put(
      `/user/${JUPYTER_USERNAME}/api/contents/${notebookName}.ipynb`,
      {
        type: 'notebook',
        content: {
          cells: [],
          metadata: {},
          nbformat: 4,
          nbformat_minor: 5,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating notebook:', error);
    throw error;
  }
};

/**
 * Get list of all notebooks
 */
export const listNotebooks = async () => {
  try {
    const response = await jupyterApi.get(`/user/${JUPYTER_USERNAME}/api/contents`);
    return response.data.content.filter((item: any) => item.type === 'notebook');
  } catch (error) {
    console.error('Error listing notebooks:', error);
    throw error;
  }
};

/**
 * Get notebook content
 */
export const getNotebook = async (notebookPath: string) => {
  try {
    const response = await jupyterApi.get(
      `/user/${JUPYTER_USERNAME}/api/contents/${notebookPath}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting notebook:', error);
    throw error;
  }
};

/**
 * Update notebook content (add/update cells)
 */
export const updateNotebook = async (notebookPath: string, content: any) => {
  try {
    const response = await jupyterApi.put(
      `/user/${JUPYTER_USERNAME}/api/contents/${notebookPath}`,
      {
        type: 'notebook',
        content,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating notebook:', error);
    throw error;
  }
};

/**
 * Delete a notebook
 */
export const deleteNotebook = async (notebookPath: string) => {
  try {
    await jupyterApi.delete(`/user/${JUPYTER_USERNAME}/api/contents/${notebookPath}`);
  } catch (error) {
    console.error('Error deleting notebook:', error);
    throw error;
  }
};

/**
 * Create or get a kernel for code execution
 */
export const createKernel = async () => {
  try {
    const response = await jupyterApi.post(`/user/${JUPYTER_USERNAME}/api/kernels`, {
      name: 'python3',
    });
    return response.data;
  } catch (error) {
    console.error('Error creating kernel:', error);
    throw error;
  }
};

/**
 * Get list of active kernels
 */
export const listKernels = async () => {
  try {
    const response = await jupyterApi.get(`/user/${JUPYTER_USERNAME}/api/kernels`);
    return response.data;
  } catch (error) {
    console.error('Error listing kernels:', error);
    throw error;
  }
};

/**
 * Delete a kernel
 */
export const deleteKernel = async (kernelId: string) => {
  try {
    await jupyterApi.delete(`/user/${JUPYTER_USERNAME}/api/kernels/${kernelId}`);
  } catch (error) {
    console.error('Error deleting kernel:', error);
    throw error;
  }
};

/**
 * Get WebSocket URL for kernel connection
 */
export const getKernelWebSocketUrl = (kernelId: string): string => {
  return `ws://localhost:8000/user/${JUPYTER_USERNAME}/api/kernels/${kernelId}/channels?token=${JUPYTER_TOKEN}`;
};
