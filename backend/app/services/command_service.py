from __future__ import annotations

import os
import re
import subprocess
from datetime import UTC, datetime
from pathlib import Path

from ..models.deployment import CommandResult
from ..settings import Settings


SECRET_FIELD_RE = re.compile(r"(?i)\b(SUBSCRIBER_KEY|SUBSCRIBER_OPC|SUBSCRIBER_OP|KI|K|OPC|OP)\b(\s*[:=]\s*)([0-9a-f]{32})")
SECRET_LINE_RE = re.compile(r"(?i)\b(SUBSCRIBER_KEY|SUBSCRIBER_OPC|SUBSCRIBER_OP|KI|K|OPC|OP)\b")
HEX_32_RE = re.compile(r"\b[0-9a-fA-F]{32}\b")


class CommandSecurityError(ValueError):
    pass


class CommandService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.project_root = settings.project_root.resolve()

    def execute_script(
        self,
        script: str | Path,
        *,
        cwd: str | Path | None = None,
        args: list[str] | None = None,
        dry_run: bool | None = None,
    ) -> CommandResult:
        script_path = self._resolve_inside_project(script)
        cwd_path = self._resolve_inside_project(cwd or ".")
        command = [str(script_path), *(args or [])]
        effective_dry_run = self.settings.dry_run if dry_run is None else dry_run

        if effective_dry_run:
            return self._run(command, cwd_path, dry_run=True)

        if not script_path.exists():
            return self._synthetic_result(command, cwd_path, 127, "", f"Script not found: {self._display_path(script_path)}", dry_run=False)
        if not script_path.is_file():
            return self._synthetic_result(command, cwd_path, 126, "", "Command is not a file", dry_run=False)
        if not os.access(script_path, os.X_OK):
            return self._synthetic_result(command, cwd_path, 126, "", "Command is not executable", dry_run=False)

        return self._run(command, cwd_path, dry_run=False)

    def execute_command(
        self,
        command: list[str],
        *,
        cwd: str | Path | None = None,
        dry_run: bool | None = None,
        timeout: int | None = None,
    ) -> CommandResult:
        if not command:
            raise CommandSecurityError("Command must not be empty")
        cwd_path = self._resolve_inside_project(cwd or ".")
        if command[0].startswith("/"):
            self._ensure_inside_project(Path(command[0]).resolve())
        return self._run(command, cwd_path, dry_run=self.settings.dry_run if dry_run is None else dry_run, timeout=timeout)

    def redact(self, value: str) -> str:
        redacted_lines: list[str] = []
        for line in value.splitlines():
            line = SECRET_FIELD_RE.sub(lambda m: f"{m.group(1)}{m.group(2)}[REDACTED]", line)
            if SECRET_LINE_RE.search(line):
                line = HEX_32_RE.sub("[REDACTED]", line)
            redacted_lines.append(line)
        return "\n".join(redacted_lines)

    def _run(self, command: list[str], cwd_path: Path, *, dry_run: bool, timeout: int | None = None) -> CommandResult:
        started_at = datetime.now(UTC)
        if dry_run:
            finished_at = datetime.now(UTC)
            display_command = [self._display_arg(arg) for arg in command]
            return CommandResult(
                command=display_command,
                cwd=self._display_path(cwd_path),
                exit_code=0,
                stdout=f"DRY RUN: {' '.join(display_command)}",
                stderr="",
                started_at=started_at,
                finished_at=finished_at,
                duration_ms=self._duration_ms(started_at, finished_at),
                timed_out=False,
                dry_run=True,
            )

        env = os.environ.copy()
        env["LAIN5G_DRY_RUN"] = "false"
        try:
            completed = subprocess.run(
                command,
                cwd=cwd_path,
                capture_output=True,
                text=True,
                timeout=timeout or self.settings.command_timeout,
                check=False,
                shell=False,
                env=env,
            )
            finished_at = datetime.now(UTC)
            return CommandResult(
                command=[self._display_arg(arg) for arg in command],
                cwd=self._display_path(cwd_path),
                exit_code=completed.returncode,
                stdout=self._limit_output(self.redact(completed.stdout or "")),
                stderr=self._limit_output(self.redact(completed.stderr or "")),
                started_at=started_at,
                finished_at=finished_at,
                duration_ms=self._duration_ms(started_at, finished_at),
                timed_out=False,
                dry_run=False,
            )
        except subprocess.TimeoutExpired as exc:
            finished_at = datetime.now(UTC)
            return CommandResult(
                command=[self._display_arg(arg) for arg in command],
                cwd=self._display_path(cwd_path),
                exit_code=None,
                stdout=self._limit_output(self.redact(exc.stdout or "")),
                stderr=self._limit_output(self.redact(exc.stderr or "Command timed out")),
                started_at=started_at,
                finished_at=finished_at,
                duration_ms=self._duration_ms(started_at, finished_at),
                timed_out=True,
                dry_run=False,
            )
        except FileNotFoundError as exc:
            return self._synthetic_result(command, cwd_path, 127, "", str(exc), dry_run=False)

    def _synthetic_result(
        self,
        command: list[str],
        cwd_path: Path,
        exit_code: int,
        stdout: str,
        stderr: str,
        *,
        dry_run: bool,
    ) -> CommandResult:
        started_at = datetime.now(UTC)
        finished_at = datetime.now(UTC)
        return CommandResult(
            command=[self._display_arg(arg) for arg in command],
            cwd=self._display_path(cwd_path),
            exit_code=exit_code,
            stdout=self._limit_output(self.redact(stdout)),
            stderr=self._limit_output(self.redact(stderr)),
            started_at=started_at,
            finished_at=finished_at,
            duration_ms=self._duration_ms(started_at, finished_at),
            timed_out=False,
            dry_run=dry_run,
        )

    def _resolve_inside_project(self, value: str | Path) -> Path:
        path = Path(value)
        if path.is_absolute():
            resolved = path.resolve()
        else:
            resolved = (self.project_root / path).resolve()
        self._ensure_inside_project(resolved)
        return resolved

    def _ensure_inside_project(self, path: Path) -> None:
        if path != self.project_root and self.project_root not in path.parents:
            raise CommandSecurityError("Path is outside the project root")

    def _display_path(self, path: Path) -> str:
        try:
            return str(path.resolve().relative_to(self.project_root))
        except ValueError:
            return "[outside-project]"

    def _display_arg(self, arg: str) -> str:
        try:
            return str(Path(arg).resolve().relative_to(self.project_root))
        except (ValueError, OSError):
            return arg

    def _limit_output(self, value: str) -> str:
        if len(value) <= self.settings.max_output_chars:
            return value
        omitted = len(value) - self.settings.max_output_chars
        return f"[output truncated: {omitted} chars omitted]\n" + value[-self.settings.max_output_chars :]

    @staticmethod
    def _duration_ms(started_at: datetime, finished_at: datetime) -> int:
        return int((finished_at - started_at).total_seconds() * 1000)
