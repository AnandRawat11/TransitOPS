import api from './axios';

export const getMaintenanceLogs = async () => {
  const response = await api.get('/maintenance');
  return response.data;
};

export const createMaintenanceLog = async (data) => {
  const response = await api.post('/maintenance', data);
  return response.data;
};
