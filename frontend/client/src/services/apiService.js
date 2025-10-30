import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// --- User API Instance ---
// This instance sends the user 'token'
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add user auth token
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

// Response interceptor to handle user 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


// --- CA API Instance (NEW!) ---
// This instance sends the 'ca_token'
const caApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add CA auth token
caApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ca_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle CA 401 errors
caApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('ca_token');
      localStorage.removeItem('ca_user');
      window.location.href = '/login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);


// --- API Exports ---

// Auth APIs (use the 'api' instance)
export const authAPI = {
  registerUser: (userData) => api.post('/auth/register', userData),
  loginUser: (credentials) => api.post('/auth/login', credentials),
  emailLogin: (email) => api.post('/auth/email-login', { email }),
  
  registerCA: (caData) => api.post('/ca/auth/register', caData),
  loginCA: (credentials) => api.post('/ca/auth/login', credentials),
  
  // This one uses the user 'api' instance because it's a user action
  updatePan: (data) => api.put('/auth/update-pan', data), 
  googleAuth: (data) => api.post('/auth/google', data),
};

// Tax Filing APIs (use the user 'api' instance)
export const taxAPI = {
  startFiling: (filingData) => api.post('/tax/start-filing', filingData),
  getMyFilings: () => api.get('/tax/my-filings'),
  updateFiling: (filingId, data) => api.put(`/tax/update-filing/${filingId}`, data),
  getFiling: (filingId) => api.get(`/tax/filing/${filingId}`),
};

// Document APIs (use the user 'api' instance)
export const documentAPI = {
  uploadDocument: (filingId, documentData) => 
    api.post(`/documents/upload/${filingId}`, documentData),
  extractForm16: (documentData) => 
    api.post('/documents/extract-form16', documentData),
  getDocuments: (filingId) => 
    api.get(`/documents/${filingId}`),
};

// CA APIs (use the new 'caApi' instance)
export const caAPI = {
  getDashboard: () => caApi.get('/ca/dashboard'),
  getClients: () => caApi.get('/ca/clients'), // This will now send the ca_token
  getClientFilings: (clientId) => caApi.get(`/ca/clients/${clientId}/filings`), // New route
  getFilingForReview: (filingId) => caApi.get(`/ca/review/${filingId}`), // New route
  addComment: (filingId, commentData) => 
    caApi.post(`/ca/comment/${filingId}`, commentData),
  updateFilingStatus: (filingId, status) => 
    caApi.put(`/ca/update-status/${filingId}`, { status }),
  resolveComment: (filingId, commentId) => 
    caApi.put(`/ca/resolve-comment/${filingId}/${commentId}`),
};

// AI APIs (use the user 'api' instance, as these are user-facing features)
export const aiAPI = {
  compareRegimes: (data) => api.post('/ai/compare-regimes', data),
  getDeductionRecommendations: (data) => 
    api.post('/ai/deduction-recommendations', data),
  chatWithAssistant: (data) => api.post('/ai/chat', data),
};

// Analytics APIs (use the user 'api' instance)
export const analyticsAPI = {
  getAnalytics: () => api.get('/analytics'),
};

// Utility function to check auth status
export const checkAuth = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    return {
      isAuthenticated: true,
      user: JSON.parse(user)
    };
  }
  
  return {
    isAuthenticated: false,
    user: null
  };
};

// Export default 'api' for general use, but 'caApi' for specific CA calls
export default api;
export { caApi };