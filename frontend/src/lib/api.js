import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
});

export const getExplanation = async (formData) => {
  const response = await api.post('/explain', formData);
  return response.data;
};

export const getPrediction = async (formData) => {
  const response = await api.post('/predict', formData);
  return response.data;
};

export const getEvaluation = async () => {
  const response = await api.get('/evaluation');
  return response.data;
};

export const getQueries = async () => {
  const response = await api.get('/queries');
  return response.data;
};

export default api;
