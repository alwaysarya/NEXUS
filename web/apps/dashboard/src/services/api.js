import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchNodes = async () => {
  const response = await api.get('/nodes');
  return response.data;
};

export const login = async (username, password) => {
  const response = await api.post('/login', { username, password });
  return response.data;
};
