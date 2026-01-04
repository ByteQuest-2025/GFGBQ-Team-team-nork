import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: async (credentials: any) => {
        const { data } = await api.post('/auth/login', credentials);
        if (data.data.accessToken) {
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('userEmail', data.data.user.email);
        }
        return data;
    },
    logout: async () => {
        await api.post('/auth/logout');
        localStorage.removeItem('accessToken');
    }
};

export const scraperService = {
    scrape: async (url: string, ignoreRobots: boolean = false) => {
        const { data } = await api.post('/api/scrape', { url, ignoreRobots });
        return data;
    },
    getRandomSample: async () => {
        const { data } = await api.get('/api/scrape/random-sample');
        return data;
    },
    verifyText: async (text: string) => {
        const { data } = await api.post('/api/scrape/verify-text', { text });
        return data;
    }
};

export default api;
