import api from './axios';

export const getTrips = async () => {
  const response = await api.get('/trips');
  return response.data;
};

export const createTrip = async (data) => {
  const response = await api.post('/trips', data);
  return response.data;
};
