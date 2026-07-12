import api from '@/api/axios';

export const analyticsApi = {
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  exportReport: async (type, format) => {
    // Generate the PDF/CSV/Excel blob
    const response = await api.get(`/analytics/export?type=${type}&format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getScheduledReports: async () => {
    const response = await api.get('/analytics/schedules');
    return response.data;
  },

  createScheduledReport: async (data) => {
    const response = await api.post('/analytics/schedules', data);
    return response.data;
  }
};
