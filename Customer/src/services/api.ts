import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('customerToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerData');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    customer: {
      _id: string;
      name: string;
      email: string;
      createdAt: string;
    };
    token: string;
    userType: string;
  };
}

// Auth API calls
export const authAPI = {
  register: (data: RegisterData): Promise<AuthResponse> =>
    api.post('/auth/customer/register', data).then(res => res.data),
  
  login: (data: LoginData): Promise<AuthResponse> =>
    api.post('/auth/customer/login', data).then(res => res.data),
  
  getProfile: () =>
    api.get('/auth/customer/profile').then(res => res.data),
  
  logout: () =>
    api.post('/auth/customer/logout').then(res => res.data),
};

export default api;