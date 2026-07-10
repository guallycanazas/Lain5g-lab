from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


DeploymentState = Literal["running", "stopped", "partial", "error", "unknown", "dry_run"]


class ErrorDetail(BaseModel):
    code: str
    message: str
    exit_code: int | None = None
    stderr: str | None = None
    active_scenario: str | None = None


class ErrorResponse(BaseModel):
    detail: ErrorDetail


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "lain5g-lab-backend"
    dry_run: bool


class CommandResult(BaseModel):
    command: list[str]
    cwd: str
    exit_code: int | None
    stdout: str = ""
    stderr: str = ""
    started_at: datetime
    finished_at: datetime
    duration_ms: int
    timed_out: bool = False
    dry_run: bool = False


class ContainerStatus(BaseModel):
    name: str
    service: str | None = None
    status: str
    running: bool


class DeploymentSummary(BaseModel):
    id: str
    name: str
    description: str = ""
    path: str
    status: DeploymentState
    mode: str = "simulation"
    supported_actions: list[str]
    validation_checks: list[str] = Field(default_factory=list)
    rf_capable: bool = False
    components: list[str] = Field(default_factory=list)


class DeploymentStatus(BaseModel):
    id: str
    status: DeploymentState
    containers: list[ContainerStatus] = Field(default_factory=list)
    checked_at: datetime
    command: CommandResult
    output: str = ""


class DeploymentActionResponse(BaseModel):
    id: str
    action: str
    status: DeploymentState
    command: CommandResult
    message: str


class LogsResponse(BaseModel):
    id: str
    container: str | None = None
    tail: int
    command: CommandResult


class RawPayload(BaseModel):
    data: dict[str, Any]
