import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchNodes = async () => (await api.get('/nodes')).data;
export const fetchDeployments = async () => (await api.get('/deployments')).data;
export const fetchWorkloads = async () => (await api.get('/workloads')).data;
export const fetchNetworking = async () => (await api.get('/networking')).data;
export const fetchStorage = async () => (await api.get('/storage')).data;
export const fetchCost = async () => (await api.get('/cost')).data;
export const fetchAutomation = async () => (await api.get('/automation')).data;
export const fetchRealMetrics = async (env = 'production', region = 'us-east-1') => (await api.get(`/real-metrics?env=${env}&region=${region}`)).data;
export const fetchNetworkMetrics = async () => (await api.get('/network-metrics')).data;
export const fetchStorageMetrics = async () => (await api.get('/storage-metrics')).data;
export const fetchObservabilityMetrics = async () => (await api.get('/observability-metrics')).data;
export const fetchAutomationMetrics = async () => (await api.get('/automation-metrics')).data;
export const fetchTracesMetrics = async () => (await api.get('/traces-metrics')).data;
export const fetchAlertsMetrics = async () => (await api.get('/alerts-metrics')).data;
export const fetchSecurityMetrics = async () => (await api.get('/security-metrics')).data;
export const fetchCostMetrics = async () => (await api.get('/cost-metrics')).data;
export const fetchAWSMetrics = async () => (await api.get('/aws-metrics')).data; // Naya AWS fetch
export const login = async (username, password) => (await api.post('/login', { username, password })).data;
