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

export const fetchNodes = async () => (await api.get('/nodes')).data;
export const fetchDeployments = async () => (await api.get('/deployments')).data;
export const fetchWorkloads = async () => (await api.get('/workloads')).data;
export const fetchNetworking = async () => (await api.get('/networking')).data;
export const fetchStorage = async () => (await api.get('/storage')).data;
export const fetchCost = async () => (await api.get('/cost')).data;
export const fetchAutomation = async () => (await api.get('/automation')).data;
export const login = async (username, password) => (await api.post('/login', { username, password })).data;
