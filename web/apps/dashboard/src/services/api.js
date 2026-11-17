const API_URL = 'http://127.0.0.1:8080/api';

export const fetchNodes = async () => (await fetch(`${API_URL}/nodes`)).json();
export const fetchRealMetrics = async (env, region) => (await fetch(`${API_URL}/real-metrics?env=${env}&region=${region}`)).json();
export const fetchAWSMetrics = async () => (await fetch(`${API_URL}/aws-metrics`)).json();
export const fetchGCPMetrics = async () => (await fetch(`${API_URL}/gcp-metrics`)).json();
export const fetchAzureMetrics = async () => (await fetch(`${API_URL}/azure-metrics`)).json();
export const fetchTrafficHistory = async () => (await fetch(`${API_URL}/traffic-metrics`)).json();
export const fetchDeployments = async () => (await fetch(`${API_URL}/deployments`)).json();

// Baaki pages ke functions (jo error de rahe the)
export const fetchSecurityMetrics = async () => (await fetch(`${API_URL}/security-metrics`)).json();
export const fetchNetworkingMetrics = async () => (await fetch(`${API_URL}/network-metrics`)).json();
export const fetchStorageMetrics = async () => (await fetch(`${API_URL}/storage-metrics`)).json();
export const fetchObservabilityMetrics = async () => (await fetch(`${API_URL}/observability-metrics`)).json();
export const fetchAutomationMetrics = async () => (await fetch(`${API_URL}/automation-metrics`)).json();
export const fetchCostMetrics = async () => (await fetch(`${API_URL}/cost-metrics`)).json();
export const fetchAlertsMetrics = async () => (await fetch(`${API_URL}/alerts-metrics`)).json();
export const fetchTracesMetrics = async () => (await fetch(`${API_URL}/traces-metrics`)).json();
export const fetchWorkloads = async () => (await fetch(`${API_URL}/workloads`)).json();
export const fetchNetworking = async () => (await fetch(`${API_URL}/networking`)).json();
export const fetchStorage = async () => (await fetch(`${API_URL}/storage`)).json();
export const fetchCost = async () => (await fetch(`${API_URL}/cost`)).json();
export const fetchAutomation = async () => (await fetch(`${API_URL}/automation`)).json();
export const fetchPredict = async () => (await fetch(`${API_URL}/predict`)).json();

export const fetchNetworkMetrics = async () => (await fetch(`${API_URL}/network-metrics`)).json();
export const fetchStorageMetrics2 = async () => (await fetch(`${API_URL}/storage-metrics`)).json();
export const fetchSecurity = async () => (await fetch(`${API_URL}/security-metrics`)).json();
export const fetchClusters = async () => (await fetch(`${API_URL}/nodes`)).json();
