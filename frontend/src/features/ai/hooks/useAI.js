import { useQuery, useMutation } from '@tanstack/react-query';
import { aiApi } from '../services/aiApi';
import toast from 'react-hot-toast';

export const AI_KEYS = {
  all: ['ai'],
  fleetHealth: () => [...AI_KEYS.all, 'fleetHealth'],
  maintenance: () => [...AI_KEYS.all, 'maintenance'],
  fuel: () => [...AI_KEYS.all, 'fuel'],
  drivers: () => [...AI_KEYS.all, 'drivers'],
  costs: () => [...AI_KEYS.all, 'costs'],
};

export const useFleetHealth = () => {
  return useQuery({
    queryKey: AI_KEYS.fleetHealth(),
    queryFn: aiApi.getFleetHealth,
  });
};

export const usePredictiveMaintenance = () => {
  return useQuery({
    queryKey: AI_KEYS.maintenance(),
    queryFn: aiApi.getPredictiveMaintenance,
  });
};

export const useFuelAnalysis = () => {
  return useQuery({
    queryKey: AI_KEYS.fuel(),
    queryFn: aiApi.getFuelAnalysis,
  });
};

export const useDriverPerformance = () => {
  return useQuery({
    queryKey: AI_KEYS.drivers(),
    queryFn: aiApi.getDriverPerformance,
  });
};

export const useCostPrediction = () => {
  return useQuery({
    queryKey: AI_KEYS.costs(),
    queryFn: aiApi.getCostPrediction,
  });
};

export const useCopilotChat = () => {
  return useMutation({
    mutationFn: (prompt) => aiApi.chatCopilot(prompt),
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to communicate with Copilot');
    },
  });
};
