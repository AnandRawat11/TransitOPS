import { useQuery } from '@tanstack/react-query';
import { activityApi } from '../services/activityApi';

export const ACTIVITY_KEYS = {
  all: ['activity'],
  recent: (module) => [...ACTIVITY_KEYS.all, 'recent', module],
};

export const useRecentActivities = (moduleFilter = '') => {
  return useQuery({
    queryKey: ACTIVITY_KEYS.recent(moduleFilter),
    queryFn: () => activityApi.getRecentActivities(moduleFilter),
  });
};
