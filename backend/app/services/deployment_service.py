from __future__ import annotations

import re
from datetime import UTC, datetime

from ..models.deployment import (
    CommandResult,
    ContainerStatus,
    DeploymentActionResponse,
    DeploymentState,
    DeploymentStatus,
    DeploymentSummary,
    LogsResponse,
)
from ..models.validation import ValidationReport
from ..settings import Settings
from .command_service import CommandService
from .run_service import RunService
from .validation_service import ValidationService


SUPPORTED_ACTIONS = ["start", "stop", "restart", "status", "validate", "logs"]
EXPECTED_SERVICES = ["mongo", "nrf", "amf", "smf", "upf", "ausf", "udm", "udr", "pcf", "gnb", "ue"]
CONTAINER_RE = re.compile(r"^lain5g-lab-5g-sa-(?P<service>[a-z0-9-]+)\s+")


class DeploymentNotFoundError(ValueError):
    pass


class DeploymentConflictError(RuntimeError):
    pass


class DeploymentCommandError(RuntimeError):
    def __init__(self, code: str, message: str, result: CommandResult):
        super().__init__(message)
        self.code = code
        self.message = message
        self.result = result


class DeploymentService:
    def __init__(
        self,
        settings: Settings,
        command_service: CommandService,
        run_service: RunService,
        validation_service: ValidationService,
    ):
        self.settings = settings
        self.command_service = command_service
        self.run_service = run_service
        self.validation_service = validation_service

    def list_deployments(self) -> list[DeploymentSummary]:
        return [self.get_deployment("5g-sa")]

    def get_deployment(self, scenario: str) -> DeploymentSummary:
        self._ensure_scenario(scenario)
        status = self.get_status(scenario)
        return DeploymentSummary(
            id="5g-sa",
            name="5G SA",
            path="deployments/5g-sa",
            status=status.status,
            supported_actions=SUPPORTED_ACTIONS,
        )

    def start(self, scenario: str) -> DeploymentActionResponse:
        self._ensure_scenario(scenario)
        if not self.settings.dry_run:
            current = self.get_status(scenario)
            if current.status == "running":
                raise DeploymentConflictError("Deployment is already running")
        result = self._execute_script("start")
        if self._failed(result):
            raise DeploymentCommandError("DEPLOYMENT_START_FAILED", "The 5G SA deployment could not be started.", result)
        status = "dry_run" if result.dry_run else self.get_status(scenario).status
        return DeploymentActionResponse(id=scenario, action="start", status=status, command=result, message="Start command executed")

    def stop(self, scenario: str) -> DeploymentActionResponse:
        self._ensure_scenario(scenario)
        result = self._execute_script("stop")
        if self._failed(result):
            raise DeploymentCommandError("DEPLOYMENT_STOP_FAILED", "The 5G SA deployment could not be stopped.", result)
        status = "dry_run" if result.dry_run else self.get_status(scenario).status
        return DeploymentActionResponse(id=scenario, action="stop", status=status, command=result, message="Stop command executed")

    def restart(self, scenario: str) -> DeploymentActionResponse:
        self._ensure_scenario(scenario)
        result = self._execute_script("restart")
        if self._failed(result):
            raise DeploymentCommandError("DEPLOYMENT_RESTART_FAILED", "The 5G SA deployment could not be restarted.", result)
        status = "dry_run" if result.dry_run else self.get_status(scenario).status
        return DeploymentActionResponse(id=scenario, action="restart", status=status, command=result, message="Restart command executed")

    def get_status(self, scenario: str) -> DeploymentStatus:
        self._ensure_scenario(scenario)
        result = self._execute_script("status")
        if result.dry_run:
            state: DeploymentState = "dry_run"
            containers: list[ContainerStatus] = []
        elif self._failed(result):
            state = "error"
            containers = []
        else:
            containers = self._parse_containers(result.stdout)
            state = self._state_from_containers(containers)
        return DeploymentStatus(
            id=scenario,
            status=state,
            containers=containers,
            checked_at=datetime.now(UTC),
            command=result,
            output=result.stdout,
        )

    def logs(self, scenario: str, *, container: str | None = None, tail: int | None = None) -> LogsResponse:
        self._ensure_scenario(scenario)
        resolved_tail = tail or self.settings.log_tail_lines
        if resolved_tail < 1 or resolved_tail > 5000:
            raise ValueError("tail must be between 1 and 5000")
        if container is not None and container not in EXPECTED_SERVICES:
            raise ValueError("Unknown container")

        if container is None and tail is None:
            result = self._execute_script("logs")
        else:
            command = ["docker", "compose", "--env-file", ".env", "-f", "docker-compose.yml", "logs", "--no-color", "--tail", str(resolved_tail)]
            if container:
                command.append(container)
            result = self.command_service.execute_command(command, cwd="deployments/5g-sa")
        if self._failed(result):
            raise DeploymentCommandError("DEPLOYMENT_LOGS_FAILED", "Logs could not be collected.", result)
        return LogsResponse(id=scenario, container=container, tail=resolved_tail, command=result)

    def validate(self, scenario: str) -> ValidationReport:
        self._ensure_scenario(scenario)
        if self.settings.dry_run:
            return self.validation_service.dry_run_report(scenario)
        result = self._execute_script("validate")
        if result.timed_out:
            raise DeploymentCommandError("DEPLOYMENT_VALIDATE_TIMEOUT", "Validation timed out.", result)
        if result.exit_code != 0:
            raise DeploymentCommandError("DEPLOYMENT_VALIDATE_FAILED", "Validation command failed.", result)
        latest = self.run_service.latest_run(scenario=scenario)
        if latest is None:
            raise RuntimeError("Validation completed but no run was found")
        return self.validation_service.report_from_run(latest)

    def _execute_script(self, name: str) -> CommandResult:
        return self.command_service.execute_script(
            f"deployments/5g-sa/scripts/{name}.sh",
            cwd="deployments/5g-sa",
        )

    def _ensure_scenario(self, scenario: str) -> None:
        if scenario != "5g-sa":
            raise DeploymentNotFoundError(f"Unknown deployment scenario: {scenario}")

    @staticmethod
    def _failed(result: CommandResult) -> bool:
        return result.timed_out or result.exit_code not in (0, None) if result.timed_out else result.exit_code != 0

    def _parse_containers(self, stdout: str) -> list[ContainerStatus]:
        containers: list[ContainerStatus] = []
        for line in stdout.splitlines():
            match = CONTAINER_RE.match(line)
            if not match:
                continue
            service = match.group("service")
            running = " Up " in f" {line} " or " Up" in line
            status = "running" if running else "stopped"
            containers.append(ContainerStatus(name=f"lain5g-lab-5g-sa-{service}", service=service, status=status, running=running))
        return containers

    @staticmethod
    def _state_from_containers(containers: list[ContainerStatus]) -> DeploymentState:
        if not containers:
            return "stopped"
        running_services = {container.service for container in containers if container.running}
        if all(service in running_services for service in EXPECTED_SERVICES):
            return "running"
        if not running_services:
            return "stopped"
        return "partial"
