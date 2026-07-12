import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '../services/analyticsApi';
import toast from 'react-hot-toast';

export const ANALYTICS_KEYS = {
  all: ['analytics'],
  dashboard: () => [...ANALYTICS_KEYS.all, 'dashboard'],
  schedules: () => [...ANALYTICS_KEYS.all, 'schedules'],
};

export const useExecutiveDashboard = () => {
  return useQuery({
    queryKey: ANALYTICS_KEYS.dashboard(),
    queryFn: analyticsApi.getDashboard,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useScheduledReports = () => {
  return useQuery({
    queryKey: ANALYTICS_KEYS.schedules(),
    queryFn: analyticsApi.getScheduledReports,
  });
};

export const useExportReport = () => {
  return useMutation({
    mutationFn: ({ type, format }) => analyticsApi.exportReport(type, format),
    onSuccess: (blob, variables) => {
      // Trigger browser download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${Date.now()}.${variables.format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success(`Successfully exported ${variables.format} report`);
    },
    onError: () => {
      toast.error('Failed to export report');
    }
  });
};

export const useCreateScheduledReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: analyticsApi.createScheduledReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.schedules() });
      toast.success('Scheduled report created successfully');
    },
    onError: () => {
      toast.error('Failed to create scheduled report');
    }
  });
};
