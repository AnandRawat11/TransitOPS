import api from './axios';

export const getReports = async () => {
  const response = await api.get('/reports');
  return response.data;
};
