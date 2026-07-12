import api from '@/api/axios';

export const adminApi = {
  getUsers: async (search) => {
    const url = search ? `/admin/users?search=${search}` : '/admin/users';
    const res = await api.get(url);
    return res.data;
  },
  updateUserRole: async (id, role) => {
    const res = await api.patch(`/admin/users/${id}/role`, { role });
    return res.data;
  },
  toggleUserStatus: async (id) => {
    const res = await api.patch(`/admin/users/${id}/toggle-status`);
    return res.data;
  }
};
