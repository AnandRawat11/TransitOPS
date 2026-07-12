import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fuelApi } from '../services/fuelApi';
import toast from 'react-hot-toast';

export const FUEL_KEYS = {
  all: ['fuel'],
  lists: () => [...FUEL_KEYS.all, 'list'],
  list: (filters) => [...FUEL_KEYS.lists(), { filters }],
  details: () => [...FUEL_KEYS.all, 'detail'],
  detail: (id) => [...FUEL_KEYS.details(), id],
};

// Also need to invalidate these when fuel is added
const VEHICLE_KEYS = { all: ['vehicles'] };
const EXPENSE_KEYS = { all: ['expenses'] }; 

export const useFuelLogs = (filters) => {
  return useQuery({
    queryKey: FUEL_KEYS.list(filters),
    queryFn: () => fuelApi.getFuelLogs(filters),
    keepPreviousData: true,
  });
};

export const useFuelLog = (id) => {
  return useQuery({
    queryKey: FUEL_KEYS.detail(id),
    queryFn: () => fuelApi.getFuelLogById(id),
    enabled: !!id,
  });
};

export const useCreateFuelLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fuelApi.createFuelLog,
    onSuccess: () => {
      toast.success('Fuel log created successfully');
      queryClient.invalidateQueries({ queryKey: FUEL_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: VEHICLE_KEYS.all }); // Odometer updated
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all }); // Expense auto-spawned
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create fuel log');
    },
  });
};
