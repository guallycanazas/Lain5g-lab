from functools import lru_cache
from pathlib import Path
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


def default_project_root() -> Path:
    return Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    project_root: Path = Field(default_factory=default_project_root, alias="LAIN5G_PROJECT_ROOT")
    scenario: str = Field(default="5g-sa", alias="LAIN5G_SCENARIO")
    dry_run: bool = Field(default=False, alias="LAIN5G_DRY_RUN")
    command_timeout: int = Field(default=300, ge=1, le=3600, alias="LAIN5G_COMMAND_TIMEOUT")
    log_tail_lines: int = Field(default=500, ge=1, le=5000, alias="LAIN5G_LOG_TAIL_LINES")
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:5173", "http://127.0.0.1:5173"],
        alias="LAIN5G_CORS_ORIGINS",
    )
    max_output_chars: int = Field(default=20000, ge=1000, le=200000, alias="LAIN5G_MAX_OUTPUT_CHARS")

    model_config = SettingsConfigDict(
        env_file="backend/.env",
        env_file_encoding="utf-8",
        populate_by_name=True,
        extra="ignore",
    )

    @field_validator("project_root")
    @classmethod
    def resolve_project_root(cls, value: Path) -> Path:
        return value.expanduser().resolve()

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> list[str]:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value  # type: ignore[return-value]


@lru_cache
def get_settings() -> Settings:
    return Settings()
