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
        // Do not send Authorization header for public endpoints (login, register)
        const isPublic = config.url && (config.url.includes('/login/') || config.url.includes('/register/'));
        if (!isPublic) {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor to handle authentication errors (e.g., expired/invalid tokens)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear the invalid/expired token from local storage
            localStorage.removeItem('token');
            
            // Redirect to login page if the user is not on a public page
            const path = window.location.pathname;
            if (!path.endsWith('/login') && !path.endsWith('/register') && path !== '/') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;