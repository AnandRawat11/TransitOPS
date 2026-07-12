import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/adminApi';
import toast from 'react-hot-toast';

export const ADMIN_KEYS = {
  all: ['admin'],
  users: (search) => [...ADMIN_KEYS.all, 'users', search],
};

export const useAdminUsers = (search = '') => {
  return useQuery({
    queryKey: ADMIN_KEYS.users(search),
    queryFn: () => adminApi.getUsers(search),
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }) => adminApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.all });
      toast.success('User role updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.toggleUserStatus(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.all });
      toast.success(`User ${data.data.isActive ? 'activated' : 'deactivated'}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to toggle status');
    }
  });
};
