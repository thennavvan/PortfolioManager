import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ASSETS ENDPOINTS
export const assetService = {
  getAllAssets: () => apiClient.get('/assets'),
  addAsset: (assetData) => apiClient.post('/assets', assetData),
  deleteAsset: (id) => apiClient.delete(`/assets/${id}`),
  getAssetSummary: () => apiClient.get('/assets/summary'),
  getLivePrice: (symbol) => apiClient.get(`/assets/price/${symbol}`),
};

// PORTFOLIO ENDPOINTS
export const portfolioService = {
  getPortfolioSummary: () => apiClient.get('/portfolio/summary'),
  getPortfolioHoldings: () => apiClient.get('/portfolio/holdings'),
  getPortfolioAllocation: () => apiClient.get('/portfolio/allocation'),
};

// Centralized error handler
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      status: error.response.status,
      message: error.response.data?.message || 'An error occurred',
      data: error.response.data,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      status: null,
      message: 'No response from server. Make sure backend is running at http://localhost:8080',
      data: null,
    };
  } else {
    // Error in request setup
    return {
      status: null,
      message: error.message || 'An unexpected error occurred',
      data: null,
    };
  }
};

export default apiClient;
