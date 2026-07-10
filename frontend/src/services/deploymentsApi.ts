import { apiRequest } from './apiClient';
import type { DeploymentActionResponse, DeploymentStatus, HealthResponse, LogsResponse } from '../types/deployment';
import type { ValidationReport } from '../types/validation';

const scenario = '5g-sa';

export const deploymentsApi = {
  health: () => apiRequest<HealthResponse>('/api/health'),
  status: () => apiRequest<DeploymentStatus>(`/api/deployments/${scenario}/status`),
  start: () => apiRequest<DeploymentActionResponse>(`/api/deployments/${scenario}/start`, { method: 'POST' }),
  stop: () => apiRequest<DeploymentActionResponse>(`/api/deployments/${scenario}/stop`, { method: 'POST' }),
  restart: () => apiRequest<DeploymentActionResponse>(`/api/deployments/${scenario}/restart`, { method: 'POST' }),
  validate: () => apiRequest<ValidationReport>(`/api/deployments/${scenario}/validate`, { method: 'POST' }),
  logs: (container: string | null, tail: number) => {
    const params = new URLSearchParams({ tail: String(tail) });
    if (container) params.set('container', container);
    return apiRequest<LogsResponse>(`/api/deployments/${scenario}/logs?${params.toString()}`);
  },
};
