import api from './axios';

export const getDrivers = async () => {
  const response = await api.get('/drivers');
  return response.data;
};

export const createDriver = async (data) => {
  const response = await api.post('/drivers', data);
  return response.data;
};
