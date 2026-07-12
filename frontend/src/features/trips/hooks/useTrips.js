import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripApi } from '../services/tripApi';

const TRIP_KEYS = {
  all: ['trips'],
  lists: () => [...TRIP_KEYS.all, 'list'],
  list: (filters) => [...TRIP_KEYS.lists(), { filters }],
  details: () => [...TRIP_KEYS.all, 'detail'],
  detail: (id) => [...TRIP_KEYS.details(), id],
  dashboard: ['trips', 'dashboard'],
};

export const useTrips = (filters = {}) => {
  return useQuery({
    queryKey: TRIP_KEYS.list(filters),
    queryFn: () => tripApi.getAll(filters),
    keepPreviousData: true,
  });
};

export const useTrip = (id) => {
  return useQuery({
    queryKey: TRIP_KEYS.detail(id),
    queryFn: () => tripApi.getById(id),
    enabled: !!id,
  });
};

export const useTripDashboardSummary = () => {
  return useQuery({
    queryKey: [...TRIP_KEYS.dashboard, 'summary'],
    queryFn: () => tripApi.getSummary(),
  });
};

export const useTripDashboardAnalytics = () => {
  return useQuery({
    queryKey: [...TRIP_KEYS.dashboard, 'analytics'],
    queryFn: () => tripApi.getAnalytics(),
  });
};

export const useCreateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tripApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRIP_KEYS.all });
      // Invalidate vehicles since assignment affects vehicle status
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useUpdateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tripApi.update,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TRIP_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: TRIP_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useUpdateTripStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tripApi.updateStatus,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TRIP_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: TRIP_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TRIP_KEYS.dashboard });
      // Status changes (like COMPLETED or IN_PROGRESS) alter vehicle availability
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useDeleteTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tripApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRIP_KEYS.all });
    },
  });
};
