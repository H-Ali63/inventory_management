from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError
from app.core.logging import get_logger

logger = get_logger(__name__)


class AppException(Exception):
    def __init__(self, status_code: int, detail: str, error_code: str = None):
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code or "APP_ERROR"
        super().__init__(detail)


class NotFoundException(AppException):
    def __init__(self, resource: str, id: any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} with id '{id}' not found.",
            error_code="NOT_FOUND",
        )


class ConflictException(AppException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            error_code="CONFLICT",
        )


class BadRequestException(AppException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            error_code="BAD_REQUEST",
        )


class InsufficientStockException(AppException):
    def __init__(self, product_name: str, available: int, requested: int):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Insufficient stock for '{product_name}'. Available: {available}, Requested: {requested}.",
            error_code="INSUFFICIENT_STOCK",
        )


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    logger.warning(
        "Application exception",
        path=str(request.url),
        status_code=exc.status_code,
        detail=exc.detail,
        error_code=exc.error_code,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error_code": exc.error_code},
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    # Serialize errors — convert any non-JSON-serializable ctx values to strings
    def _safe_errors(errors):
        result = []
        for err in errors:
            safe = {k: v for k, v in err.items() if k != "ctx"}
            if "ctx" in err:
                safe["ctx"] = {
                    k: str(v) for k, v in err["ctx"].items()
                }
            result.append(safe)
        return result

    safe = _safe_errors(exc.errors())
    logger.warning("Validation error", path=str(request.url), errors=safe)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Request validation failed.",
            "error_code": "VALIDATION_ERROR",
            "errors": safe,
        },
    )


async def integrity_error_handler(
    request: Request, exc: IntegrityError
) -> JSONResponse:
    logger.error("Database integrity error", path=str(request.url), error=str(exc))
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={
            "detail": "A database constraint was violated. The resource may already exist.",
            "error_code": "INTEGRITY_ERROR",
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(
        "Unhandled exception", path=str(request.url), error=str(exc), exc_info=True
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred.",
            "error_code": "INTERNAL_SERVER_ERROR",
        },
    )
