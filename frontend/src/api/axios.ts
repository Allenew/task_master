import axios from 'axios';
import { getCookie } from '../utils/cookies';
import toast from 'react-hot-toast';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
});

api.interceptors.request.use(
  (config) => {
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// add response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      toast.error('Your session has expired. Please log in again.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
    return Promise.reject(error);
  }
);

export default api;
