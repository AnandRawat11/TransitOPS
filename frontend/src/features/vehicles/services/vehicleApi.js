import api from '@/api/axios';

export const vehicleApi = {
  // GET /vehicles?page=1&limit=10&status=AVAILABLE...
  getAll: async (params) => {
    const { data } = await api.get('/vehicles', { params });
    return data;
  },

  // GET /vehicles/available
  getAvailable: async (params) => {
    const { data } = await api.get('/vehicles/available', { params });
    return data.data; // sendSuccess returns { data: [...] }
  },

  // GET /vehicles/:id
  getById: async (id) => {
    const { data } = await api.get(`/vehicles/${id}`);
    return data.data;
  },

  // POST /vehicles
  create: async (vehicleData) => {
    const { data } = await api.post('/vehicles', vehicleData);
    return data.data;
  },

  // PUT /vehicles/:id
  update: async ({ id, data }) => {
    const { data: response } = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },

  // PATCH /vehicles/:id/status
  updateStatus: async ({ id, status }) => {
    const { data } = await api.patch(`/vehicles/${id}/status`, { status });
    return data.data;
  },

  // DELETE /vehicles/:id
  delete: async (id) => {
    const { data } = await api.delete(`/vehicles/${id}`);
    return data.data;
  },

  // GET /dashboard/summary
  getSummary: async () => {
    const { data } = await api.get('/dashboard/summary');
    return data.data;
  },

  // GET /dashboard/analytics
  getAnalytics: async () => {
    const { data } = await api.get('/dashboard/analytics');
    return data.data;
  },
};
