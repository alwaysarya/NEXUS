import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const fetchNodes = async () => {
  const response = await api.get('/nodes');
  return response.data;
};
