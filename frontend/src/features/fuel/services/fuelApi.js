import api from '../../../services/api';

export const fuelApi = {
  getFuelLogs: async (params) => {
    const response = await api.get('/fuel', { params });
    return response.data;
  },

  getFuelLogById: async (id) => {
    const response = await api.get(`/fuel/${id}`);
    return response.data;
  },

  createFuelLog: async (data) => {
    const response = await api.post('/fuel', data);
    return response.data;
  },

  updateFuelLog: async (id, data) => {
    const response = await api.put(`/fuel/${id}`, data);
    return response.data;
  },

  deleteFuelLog: async (id) => {
    const response = await api.delete(`/fuel/${id}`);
    return response.data;
  },
};
