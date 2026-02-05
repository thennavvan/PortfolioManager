import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Error handler
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== ASSETS ====================

export const getAssets = () => {
  return apiClient.get('/assets');
};

export const createAsset = (assetData) => {
  return apiClient.post('/assets', assetData);
};

export const updateAsset = (id, assetData) => {
  return apiClient.put(`/assets/${id}`, assetData);
};

export const getAssetBySymbol = (symbol) => {
  return apiClient.get(`/assets/symbol/${symbol}`);
};

export const deleteAsset = (id) => {
  return apiClient.delete(`/assets/${id}`);
};

export const getAssetSummary = () => {
  return apiClient.get('/assets/summary');
};

export const getLivePrice = (symbol) => {
  return apiClient.get(`/assets/price/${symbol}`);
};

export const getPriceHistory = (symbol) => {
  const priceServiceUrl = 'http://localhost:8000/price-history';
  return axios.get(`${priceServiceUrl}/${symbol}`);
};

export const searchAssets = (query) => {
  const priceServiceUrl = 'http://localhost:8000/search';
  return axios.get(priceServiceUrl, { params: { q: query } });
};

// ==================== PORTFOLIO ====================

export const getPortfolioSummary = () => {
  return apiClient.get('/portfolio/summary');
};

export const getPortfolioHoldings = () => {
  return apiClient.get('/portfolio/holdings');
};

export const getPortfolioAllocation = () => {
  return apiClient.get('/portfolio/allocation');
};

export const savePortfolioSnapshot = () => {
  return apiClient.post('/portfolio/snapshot');
};

export const autoSavePortfolioSnapshot = () => {
  return apiClient.post('/portfolio/snapshot/auto');
};

export const getPortfolioHistory = (days = 30) => {
  return apiClient.get(`/portfolio/history?days=${days}`);
};

export const getAllPortfolioHistory = () => {
  return apiClient.get('/portfolio/history/all');
};

export default apiClient;
