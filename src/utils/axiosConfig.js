// utils/axiosConfig.js
import axios from 'axios';
// import { toast } from 'react-toastify';

let reduxStore = null;

export const setStore = (storeInstance) => {
    reduxStore = storeInstance;
};

const customAxios = axios.create({
    // CHANGE THIS LINE:
    baseURL: import.meta.env.VITE_API_BASE_URL, // Use import.meta.env
    timeout: 10000,
});

// Request interceptor to add auth token
customAxios.interceptors.request.use(
    (config) => {
        if (!reduxStore) {
            console.warn("Redux store not yet initialized in axios interceptor.");
            return config;
        }
        const state = reduxStore.getState();
        const token = state.globalState.authToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
customAxios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            if (reduxStore) {
                import('../store/slices/authSlice').then(({ logoutUser }) => {
                    reduxStore.dispatch(logoutUser());
                    // toast.error('Session expired. Please login again.');
                    window.location.href = '/';
                }).catch(e => {
                    console.error("Error dispatching logoutUser:", e);
                    // toast.error("An error occurred during session handling.");
                });
            } else {
                console.error("Redux store not available for dispatching logout.");
                // toast.error('Session expired. Please login again.');
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default customAxios;