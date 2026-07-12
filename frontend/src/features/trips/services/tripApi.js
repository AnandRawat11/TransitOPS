import api from '@/api/axios';

export const tripApi = {
  // GET /trips?page=1&limit=10...
  getAll: async (params) => {
    const { data } = await api.get('/trips', { params });
    return data;
  },

  // GET /trips/:id
  getById: async (id) => {
    const { data } = await api.get(`/trips/${id}`);
    return data.data;
  },

  // POST /trips
  create: async (tripData) => {
    const { data } = await api.post('/trips', tripData);
    return data.data;
  },

  // PUT /trips/:id
  update: async ({ id, data }) => {
    const { data: response } = await api.put(`/trips/${id}`, data);
    return response.data;
  },

  // PATCH /trips/:id/status
  updateStatus: async ({ id, status, notes }) => {
    const { data } = await api.patch(`/trips/${id}/status`, { status, notes });
    return data.data;
  },

  // DELETE /trips/:id
  delete: async (id) => {
    const { data } = await api.delete(`/trips/${id}`);
    return data.data;
  },

  // GET /dashboard/trips/summary
  getSummary: async () => {
    const { data } = await api.get('/dashboard/trips/summary');
    return data.data;
  },

  // GET /dashboard/trips/analytics
  getAnalytics: async () => {
    const { data } = await api.get('/dashboard/trips/analytics');
    return data.data;
  },
};
