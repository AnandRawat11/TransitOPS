import api from '@/api/axios';

export const aiApi = {
  getFleetHealth: async () => {
    const response = await api.get('/ai/fleet-health');
    return response.data;
  },

  getPredictiveMaintenance: async () => {
    const response = await api.get('/ai/predictive-maintenance');
    return response.data;
  },

  getFuelAnalysis: async () => {
    const response = await api.get('/ai/fuel-analysis');
    return response.data;
  },

  getDriverPerformance: async () => {
    const response = await api.get('/ai/driver-performance');
    return response.data;
  },

  getCostPrediction: async () => {
    const response = await api.get('/ai/cost-prediction');
    return response.data;
  },

  chatCopilot: async (prompt) => {
    const response = await api.post('/ai/copilot/chat', { prompt });
    return response.data;
  }
};
