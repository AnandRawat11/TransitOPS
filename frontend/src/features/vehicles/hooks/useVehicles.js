import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '../services/vehicleApi';

const VEHICLE_KEYS = {
  all: ['vehicles'],
  lists: () => [...VEHICLE_KEYS.all, 'list'],
  list: (filters) => [...VEHICLE_KEYS.lists(), { filters }],
  details: () => [...VEHICLE_KEYS.all, 'detail'],
  detail: (id) => [...VEHICLE_KEYS.details(), id],
  available: ['vehicles', 'available'],
  dashboard: ['vehicles', 'dashboard'],
};

export const useVehicles = (filters = {}) => {
  return useQuery({
    queryKey: VEHICLE_KEYS.list(filters),
    queryFn: () => vehicleApi.getAll(filters),
    keepPreviousData: true,
  });
};

export const useVehicle = (id) => {
  return useQuery({
    queryKey: VEHICLE_KEYS.detail(id),
    queryFn: () => vehicleApi.getById(id),
    enabled: !!id,
  });
};

export const useAvailableVehicles = (filters = {}) => {
  return useQuery({
    queryKey: [...VEHICLE_KEYS.available, filters],
    queryFn: () => vehicleApi.getAvailable(filters),
  });
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: [...VEHICLE_KEYS.dashboard, 'summary'],
    queryFn: () => vehicleApi.getSummary(),
  });
};

export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: [...VEHICLE_KEYS.dashboard, 'analytics'],
    queryFn: () => vehicleApi.getAnalytics(),
  });
};

// Mutations
export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vehicleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_KEYS.all });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vehicleApi.update,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: VEHICLE_KEYS.lists() });
    },
  });
};

export const useUpdateVehicleStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vehicleApi.updateStatus,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: VEHICLE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: VEHICLE_KEYS.dashboard });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vehicleApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_KEYS.all });
    },
  });
};
