from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


DeploymentState = Literal["running", "stopped", "partial", "error", "unknown", "dry_run"]


class ErrorDetail(BaseModel):
    code: str
    message: str
    exit_code: int | None = None
    stderr: str | None = None


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
    path: str
    status: DeploymentState
    supported_actions: list[str]


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
