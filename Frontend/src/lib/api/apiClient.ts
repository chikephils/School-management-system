import axios from "axios";
import { store } from "../../app/store/store";
import { logout } from "../../features/auth/store/authSlice";


const API_BASE_URL = 
import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type' : 'application/json'
    },
});

apiClient.interceptors.request.use((config) => {
    const token = store.getState().auth.accessToken;

    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

apiClient.interceptors.response.use((response) => response, (error) => {
    if(error.response?.status === 401) {
        store.dispatch(logout())
    }
    return Promise.reject(error)
})
