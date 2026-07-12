import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../services/notificationApi';

export const NOTIFICATION_KEYS = {
  all: ['notifications'],
  list: (unreadOnly) => [...NOTIFICATION_KEYS.all, 'list', unreadOnly],
  count: () => [...NOTIFICATION_KEYS.all, 'count'],
};

export const useNotifications = (unreadOnly = false) => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(unreadOnly),
    queryFn: () => notificationApi.getNotifications(unreadOnly),
    refetchInterval: 30000, // Poll every 30s as a lightweight alternative to websockets
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.count(),
    queryFn: notificationApi.getUnreadCount,
    refetchInterval: 30000,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    }
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    }
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    }
  });
};
