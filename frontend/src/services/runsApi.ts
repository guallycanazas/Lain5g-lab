import { apiRequest } from './apiClient';
import type { RunDetail, RunSummary } from '../types/run';

export const runsApi = {
  list: () => apiRequest<RunSummary[]>('/api/runs'),
  latest: () => apiRequest<RunDetail>('/api/runs/latest'),
  detail: (runId: string) => apiRequest<RunDetail>(`/api/runs/${encodeURIComponent(runId)}`),
};
