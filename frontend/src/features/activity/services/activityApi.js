import api from '@/api/axios';

export const activityApi = {
  getRecentActivities: async (moduleFilter) => {
    const url = moduleFilter ? `/activity/recent?module=${moduleFilter}` : '/activity/recent';
    const res = await api.get(url);
    return res.data;
  }
};
