import api from './axios';

export const getFuelLogs = async (vehicleId = '') => {
  const url = vehicleId ? `/fuel?vehicleId=${vehicleId}` : '/fuel';
  const response = await api.get(url);
  return response.data;
};

export const createFuelLog = async (data) => {
  const response = await api.post('/fuel', data);
  return response.data;
};

export const deleteFuelLog = async (id) => {
  const response = await api.delete(`/fuel/${id}`);
  return response.data;
};
