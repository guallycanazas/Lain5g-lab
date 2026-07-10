import { useQuery } from '@tanstack/react-query';
import { runsApi } from '../services/runsApi';

export function useRuns() {
  return useQuery({ queryKey: ['runs'], queryFn: () => runsApi.list() });
}

export function useRunDetail(runId?: string) {
  return useQuery({ queryKey: ['runs', runId], queryFn: () => runsApi.detail(runId || ''), enabled: Boolean(runId) });
}
