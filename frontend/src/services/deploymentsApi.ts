import { apiRequest } from './apiClient';
import type { DeploymentActionResponse, DeploymentStatus, DeploymentSummary, HealthResponse, LogsResponse } from '../types/deployment';
import type { ValidationReport } from '../types/validation';

const defaultScenario = '5g-sa';

export const deploymentsApi = {
  health: () => apiRequest<HealthResponse>('/api/health'),
  list: () => apiRequest<DeploymentSummary[]>('/api/deployments'),
  detail: (scenario = defaultScenario) => apiRequest<DeploymentSummary>(`/api/deployments/${scenario}`),
  status: (scenario = defaultScenario) => apiRequest<DeploymentStatus>(`/api/deployments/${scenario}/status`),
  start: (scenario = defaultScenario) => apiRequest<DeploymentActionResponse>(`/api/deployments/${scenario}/start`, { method: 'POST' }),
  stop: (scenario = defaultScenario) => apiRequest<DeploymentActionResponse>(`/api/deployments/${scenario}/stop`, { method: 'POST' }),
  restart: (scenario = defaultScenario) => apiRequest<DeploymentActionResponse>(`/api/deployments/${scenario}/restart`, { method: 'POST' }),
  validate: (scenario = defaultScenario) => apiRequest<ValidationReport>(`/api/deployments/${scenario}/validate`, { method: 'POST' }),
  hardwareCheck: () => apiRequest<DeploymentActionResponse>('/api/deployments/4g-lte-x310/hardware-check', { method: 'POST' }),
  preflight: () => apiRequest<DeploymentActionResponse>('/api/deployments/4g-lte-x310/preflight', { method: 'POST' }),
  startEpc: () => apiRequest<DeploymentActionResponse>('/api/deployments/4g-lte-x310/start-epc', { method: 'POST' }),
  emergencyStop: () => apiRequest<DeploymentActionResponse>('/api/deployments/4g-lte-x310/emergency-stop', { method: 'POST' }),
  logs: (container: string | null, tail: number, scenario = defaultScenario) => {
    const params = new URLSearchParams({ tail: String(tail) });
    if (container) params.set('container', container);
    return apiRequest<LogsResponse>(`/api/deployments/${scenario}/logs?${params.toString()}`);
  },
};
