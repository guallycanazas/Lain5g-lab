from functools import lru_cache

from .services.command_service import CommandService
from .services.deployment_service import DeploymentService
from .services.open5gs_connection_service import Open5GSConnectionService
from .services.run_service import RunService
from .services.subscriber_service import SubscriberService
from .services.validation_service import ValidationService
from .settings import Settings, get_settings


@lru_cache
def get_command_service() -> CommandService:
    settings = get_settings()
    return CommandService(settings)


@lru_cache
def get_run_service() -> RunService:
    settings = get_settings()
    return RunService(settings)


@lru_cache
def get_validation_service() -> ValidationService:
    return ValidationService(get_run_service())


@lru_cache
def get_deployment_service() -> DeploymentService:
    return DeploymentService(get_settings(), get_command_service(), get_run_service(), get_validation_service())


@lru_cache
def get_open5gs_connection_service() -> Open5GSConnectionService:
    return Open5GSConnectionService(get_settings())


@lru_cache
def get_subscriber_service() -> SubscriberService:
    return SubscriberService(get_settings(), get_open5gs_connection_service())


def settings_dependency() -> Settings:
    return get_settings()
