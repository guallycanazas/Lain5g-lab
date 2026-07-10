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
from .deployment_registry import DeploymentDefinition, get_deployment_definition, list_deployment_definitions
from .run_service import RunService
from .validation_service import ValidationService


CONTAINER_RE = re.compile(r"^(?P<name>lain5g-lab-[a-z0-9-]+-(?P<service>[a-z0-9-]+))\s+")


class DeploymentNotFoundError(ValueError):
    pass


class DeploymentConflictError(RuntimeError):
    def __init__(self, message: str, *, active_scenario: str | None = None):
        super().__init__(message)
        self.active_scenario = active_scenario


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
        return [self._summary(definition) for definition in list_deployment_definitions()]

    def get_deployment(self, scenario: str) -> DeploymentSummary:
        return self._summary(self._definition(scenario))

    def start(self, scenario: str) -> DeploymentActionResponse:
        definition = self._definition(scenario)
        self._ensure_action(definition, "start")
        self._ensure_no_conflict(definition)
        return self._script_action(definition, "start", "DEPLOYMENT_START_FAILED", f"{definition.name} could not be started.")

    def stop(self, scenario: str) -> DeploymentActionResponse:
        definition = self._definition(scenario)
        self._ensure_action(definition, "stop")
        return self._script_action(definition, "stop", "DEPLOYMENT_STOP_FAILED", f"{definition.name} could not be stopped.")

    def restart(self, scenario: str) -> DeploymentActionResponse:
        definition = self._definition(scenario)
        self._ensure_action(definition, "restart")
        self._ensure_no_conflict(definition)
        return self._script_action(definition, "restart", "DEPLOYMENT_RESTART_FAILED", f"{definition.name} could not be restarted.")

    def hardware_check(self, scenario: str) -> DeploymentActionResponse:
        definition = self._definition(scenario)
        self._ensure_action(definition, "hardware-check")
        return self._x310_host_network_action(definition, "hardware-check", "X310_HARDWARE_CHECK_FAILED", "X310 hardware check failed.", "hardware-check.sh")

    def preflight(self, scenario: str) -> DeploymentActionResponse:
        definition = self._definition(scenario)
        self._ensure_action(definition, "preflight")
        return self._script_action(definition, "preflight", "X310_PREFLIGHT_FAILED", "X310 preflight failed.")

    def start_epc(self, scenario: str) -> DeploymentActionResponse:
        definition = self._definition(scenario)
        self._ensure_action(definition, "start-epc")
        self._ensure_no_conflict(definition)
        return self._script_action(definition, "start-epc", "X310_EPC_START_FAILED", "X310 EPC could not be started.", script="start-epc")

    def emergency_stop(self, scenario: str) -> DeploymentActionResponse:
        definition = self._definition(scenario)
        self._ensure_action(definition, "emergency-stop")
        return self._script_action(definition, "emergency-stop", "X310_EMERGENCY_STOP_FAILED", "X310 emergency stop failed.", script="emergency-stop")

    def get_status(self, scenario: str) -> DeploymentStatus:
        definition = self._definition(scenario)
        result = self._execute_script(definition, "status")
        if result.dry_run:
            state: DeploymentState = "dry_run"
            containers: list[ContainerStatus] = []
        elif self._failed(result):
            state = "error"
            containers = []
        else:
            containers = self._parse_containers(result.stdout)
            state = self._state_from_containers(containers, definition.expected_services)
        return DeploymentStatus(id=scenario, status=state, containers=containers, checked_at=datetime.now(UTC), command=result, output=result.stdout)

    def logs(self, scenario: str, *, container: str | None = None, tail: int | None = None) -> LogsResponse:
        definition = self._definition(scenario)
        self._ensure_action(definition, "logs")
        resolved_tail = tail or self.settings.log_tail_lines
        if resolved_tail < 1 or resolved_tail > 5000:
            raise ValueError("tail must be between 1 and 5000")
        if container is not None and container not in definition.log_services:
            raise ValueError("Unknown container")
        if container is None and tail is None:
            result = self._execute_script(definition, "logs")
        else:
            command = ["docker", "compose", "--env-file", self._env_file(definition), "-f", "docker-compose.yml", "--profile", "sip", "logs", "--no-color", "--tail", str(resolved_tail)]
            if container:
                command.append(container)
            result = self.command_service.execute_command(command, cwd=definition.deployment_path)
        if self._failed(result):
            raise DeploymentCommandError("DEPLOYMENT_LOGS_FAILED", "Logs could not be collected.", result)
        return LogsResponse(id=scenario, container=container, tail=resolved_tail, command=result)

    def validate(self, scenario: str) -> ValidationReport:
        definition = self._definition(scenario)
        self._ensure_action(definition, "validate")
        if self.settings.dry_run:
            return self.validation_service.dry_run_report(scenario)
        result = self._execute_script(definition, "validate")
        if result.timed_out:
            raise DeploymentCommandError("DEPLOYMENT_VALIDATE_TIMEOUT", "Validation timed out.", result)
        if result.exit_code != 0:
            raise DeploymentCommandError("DEPLOYMENT_VALIDATE_FAILED", "Validation command failed.", result)
        latest = self.run_service.latest_run(scenario=scenario)
        if latest is None:
            raise RuntimeError("Validation completed but no run was found")
        return self.validation_service.report_from_run(latest)

    def _summary(self, definition: DeploymentDefinition) -> DeploymentSummary:
        status = self.get_status(definition.id)
        return DeploymentSummary(
            id=definition.id,
            name=definition.name,
            description=definition.description,
            path=definition.deployment_path,
            status=status.status,
            mode=definition.mode,
            supported_actions=definition.supported_actions,
            validation_checks=definition.validation_checks,
            rf_capable=definition.rf_capable,
            components=definition.expected_services,
        )

    def _script_action(self, definition: DeploymentDefinition, action: str, error_code: str, error_message: str, *, script: str | None = None) -> DeploymentActionResponse:
        result = self._execute_script(definition, script or action)
        if self._failed(result):
            raise DeploymentCommandError(error_code, error_message, result)
        status = "dry_run" if result.dry_run else self.get_status(definition.id).status
        return DeploymentActionResponse(id=definition.id, action=action, status=status, command=result, message=f"{action} command executed")

    def _x310_host_network_action(self, definition: DeploymentDefinition, action: str, error_code: str, error_message: str, script_name: str) -> DeploymentActionResponse:
        if self.settings.dry_run:
            return self._script_action(definition, action, error_code, error_message, script=script_name.removesuffix(".sh"))
        root = str(self.settings.project_root.resolve())
        command = [
            "docker", "run", "--rm", "--network", "host",
            "-v", f"{root}:{root}", "-w", root,
            "lain5g-lab/srsran4g-uhd:local",
            f"deployments/4g-volte/x310/scripts/{script_name}",
        ]
        result = self.command_service.execute_command(command, cwd=".", dry_run=False)
        if self._failed(result):
            raise DeploymentCommandError(error_code, error_message, result)
        status = self.get_status(definition.id).status
        return DeploymentActionResponse(id=definition.id, action=action, status=status, command=result, message=f"{action} command executed")

    def _execute_script(self, definition: DeploymentDefinition, name: str) -> CommandResult:
        return self.command_service.execute_script(f"{definition.scripts_dir}/{name}.sh", cwd=definition.deployment_path)

    @staticmethod
    def _env_file(definition: DeploymentDefinition) -> str:
        return "../common/.env" if definition.id in {"4g-volte-sim", "4g-lte-x310"} else ".env"

    @staticmethod
    def _failed(result: CommandResult) -> bool:
        return result.timed_out or result.exit_code != 0

    @staticmethod
    def _parse_containers(stdout: str) -> list[ContainerStatus]:
        containers: list[ContainerStatus] = []
        for line in stdout.splitlines():
            match = CONTAINER_RE.match(line)
            if not match:
                continue
            service = match.group("service")
            running = " Up " in f" {line} " or " Up" in line
            containers.append(ContainerStatus(name=match.group("name"), service=service, status="running" if running else "stopped", running=running))
        return containers

    @staticmethod
    def _state_from_containers(containers: list[ContainerStatus], expected_services: list[str]) -> DeploymentState:
        if not containers:
            return "stopped"
        running_services = {container.service for container in containers if container.running}
        if expected_services and all(service in running_services for service in expected_services):
            return "running"
        if not running_services:
            return "stopped"
        return "partial"

    @staticmethod
    def _ensure_action(definition: DeploymentDefinition, action: str) -> None:
        if action not in definition.supported_actions:
            raise ValueError(f"Action {action} is not supported for {definition.id}")

    @staticmethod
    def _definition(scenario: str) -> DeploymentDefinition:
        definition = get_deployment_definition(scenario)
        if definition is None:
            raise DeploymentNotFoundError(f"Unknown deployment scenario: {scenario}")
        return definition

    def _ensure_no_conflict(self, definition: DeploymentDefinition) -> None:
        if self.settings.dry_run:
            return
        for other in list_deployment_definitions():
            if other.id == definition.id:
                continue
            status = self.get_status(other.id).status
            if status in {"running", "partial"}:
                raise DeploymentConflictError("Another laboratory scenario is currently running.", active_scenario=other.id)
