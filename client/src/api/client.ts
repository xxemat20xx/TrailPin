import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api',
    withCredentials: true,  // sends cookies
});

export default apiClient;