import api from '@/api/axios';

export const notificationApi = {
  getNotifications: async (unreadOnly = false) => {
    const res = await api.get(`/notifications?unreadOnly=${unreadOnly}`);
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await api.get('/notifications/count');
    return res.data;
  },
  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  }
};
