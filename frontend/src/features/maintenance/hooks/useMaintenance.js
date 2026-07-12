import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi } from '../services/maintenanceApi';

const MNT_KEYS = {
  all: ['maintenance'],
  lists: () => [...MNT_KEYS.all, 'list'],
  list: (filters) => [...MNT_KEYS.lists(), { filters }],
  details: () => [...MNT_KEYS.all, 'detail'],
  detail: (id) => [...MNT_KEYS.details(), id],
  dashboard: ['maintenance', 'dashboard'],
  upcoming: ['maintenance', 'upcoming'],
  overdue: ['maintenance', 'overdue'],
  vehicle: (vid) => ['maintenance', 'vehicle', vid]
};

export const useMaintenanceList = (filters = {}) => {
  return useQuery({
    queryKey: MNT_KEYS.list(filters),
    queryFn: () => maintenanceApi.getAll(filters),
    keepPreviousData: true,
  });
};

export const useMaintenance = (id) => {
  return useQuery({
    queryKey: MNT_KEYS.detail(id),
    queryFn: () => maintenanceApi.getById(id),
    enabled: !!id,
  });
};

export const useMaintenanceDashboardSummary = () => {
  return useQuery({
    queryKey: [...MNT_KEYS.dashboard, 'summary'],
    queryFn: () => maintenanceApi.getSummary(),
  });
};

export const useMaintenanceDashboardAnalytics = () => {
  return useQuery({
    queryKey: [...MNT_KEYS.dashboard, 'analytics'],
    queryFn: () => maintenanceApi.getAnalytics(),
  });
};

export const useCreateMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: maintenanceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MNT_KEYS.all });
    },
  });
};

export const useUpdateMaintenanceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: maintenanceApi.updateStatus,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: MNT_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: MNT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: MNT_KEYS.dashboard });
      
      // CRITICAL: Changing maintenance state to IN_PROGRESS or COMPLETED 
      // affects the Vehicle's status. We must invalidate the vehicles cache.
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useDeleteMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: maintenanceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MNT_KEYS.all });
    },
  });
};
