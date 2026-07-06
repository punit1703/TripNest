import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000', // Removed the /api at the end
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to automatically add the JWT token to requests
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

export default api;