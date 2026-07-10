export type DeploymentState = 'running' | 'stopped' | 'partial' | 'error' | 'unknown' | 'dry_run';

export interface HealthResponse {
  status: string;
  service: string;
  dry_run: boolean;
}

export interface CommandResult {
  command: string[];
  cwd: string;
  exit_code: number | null;
  stdout: string;
  stderr: string;
  started_at: string;
  finished_at: string;
  duration_ms: number;
  timed_out: boolean;
  dry_run: boolean;
}

export interface ContainerStatus {
  name: string;
  service: string | null;
  status: string;
  running: boolean;
}

export interface DeploymentSummary {
  id: string;
  name: string;
  description: string;
  path: string;
  status: DeploymentState;
  mode: string;
  supported_actions: string[];
  validation_checks: string[];
  rf_capable: boolean;
  components: string[];
}

export interface DeploymentStatus {
  id: string;
  status: DeploymentState;
  containers: ContainerStatus[];
  checked_at: string;
  command: CommandResult;
  output: string;
}

export interface DeploymentActionResponse {
  id: string;
  action: string;
  status: DeploymentState;
  command: CommandResult;
  message: string;
}

export interface LogsResponse {
  id: string;
  container: string | null;
  tail: number;
  command: CommandResult;
}
