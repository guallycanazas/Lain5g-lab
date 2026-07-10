from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .api import deployments, health, runs, subscribers, validation
from .models.deployment import ErrorDetail, ErrorResponse
from .services.command_service import CommandSecurityError
from .services.deployment_service import DeploymentCommandError, DeploymentConflictError, DeploymentNotFoundError
from .services.run_service import RunSecurityError
from .services.subscriber_service import SubscriberServiceError
from .settings import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Lain5G-Lab API",
        version="0.1.0",
        description="Backend API for operating the validated Lain5G-Lab 5G SA deployment.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PATCH", "DELETE"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(deployments.router)
    app.include_router(runs.router)
    app.include_router(subscribers.router)
    app.include_router(validation.router)

    register_exception_handlers(app)
    return app


def error_response(status_code: int, code: str, message: str, *, exit_code: int | None = None, stderr: str | None = None) -> JSONResponse:
    body = ErrorResponse(detail=ErrorDetail(code=code, message=message, exit_code=exit_code, stderr=stderr))
    return JSONResponse(status_code=status_code, content=body.model_dump())


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(DeploymentNotFoundError)
    async def deployment_not_found_handler(request: Request, exc: DeploymentNotFoundError) -> JSONResponse:
        return error_response(404, "DEPLOYMENT_NOT_FOUND", str(exc))

    @app.exception_handler(DeploymentConflictError)
    async def deployment_conflict_handler(request: Request, exc: DeploymentConflictError) -> JSONResponse:
        return error_response(409, "DEPLOYMENT_CONFLICT", str(exc))

    @app.exception_handler(DeploymentCommandError)
    async def deployment_command_handler(request: Request, exc: DeploymentCommandError) -> JSONResponse:
        status_code = 504 if exc.result.timed_out else 500
        return error_response(status_code, exc.code, exc.message, exit_code=exc.result.exit_code, stderr=exc.result.stderr)

    async def bad_request_handler(request: Request, exc: Exception) -> JSONResponse:
        return error_response(400, "BAD_REQUEST", str(exc))

    app.add_exception_handler(CommandSecurityError, bad_request_handler)
    app.add_exception_handler(RunSecurityError, bad_request_handler)
    app.add_exception_handler(ValueError, bad_request_handler)

    @app.exception_handler(SubscriberServiceError)
    async def subscriber_error_handler(request: Request, exc: SubscriberServiceError) -> JSONResponse:
        return error_response(exc.status_code, exc.code, exc.message)

    @app.exception_handler(Exception)
    async def internal_error_handler(request: Request, exc: Exception) -> JSONResponse:
        return error_response(500, "INTERNAL_ERROR", "An internal backend error occurred.")


app = create_app()
