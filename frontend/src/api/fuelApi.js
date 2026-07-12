import api from './axios';

export const getFuelLogs = async () => {
  const response = await api.get('/fuel');
  return response.data;
};

export const createFuelLog = async (data) => {
  const response = await api.post('/fuel', data);
  return response.data;
};
