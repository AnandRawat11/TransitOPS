import api from '@/api/axios';

export const maintenanceApi = {
  getAll: async (params) => {
    const { data } = await api.get('/maintenance', { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/maintenance/${id}`);
    return data.data;
  },

  getByVehicle: async (vehicleId) => {
    const { data } = await api.get(`/maintenance/vehicle/${vehicleId}`);
    return data.data;
  },

  getUpcoming: async () => {
    const { data } = await api.get('/maintenance/upcoming');
    return data.data;
  },

  getOverdue: async () => {
    const { data } = await api.get('/maintenance/overdue');
    return data.data;
  },

  create: async (payload) => {
    const { data } = await api.post('/maintenance', payload);
    return data.data;
  },

  update: async ({ id, data }) => {
    const { data: response } = await api.put(`/maintenance/${id}`, data);
    return response.data;
  },

  updateStatus: async ({ id, status, notes }) => {
    const { data } = await api.patch(`/maintenance/${id}/status`, { status, notes });
    return data.data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/maintenance/${id}`);
    return data.data;
  },

  getSummary: async () => {
    const { data } = await api.get('/dashboard/maintenance/summary');
    return data.data;
  },

  getAnalytics: async () => {
    const { data } = await api.get('/dashboard/maintenance/analytics');
    return data.data;
  },
};
