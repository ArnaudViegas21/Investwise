from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.routes.goals import router as goals_router
from app.api.routes.projections import router as projections_router
from app.database.session import check_database_connection, get_db_session

app = FastAPI(title="InvestWise API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type"],
)

app.include_router(goals_router)
app.include_router(projections_router)


@app.exception_handler(SQLAlchemyError)
def database_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    return JSONResponse(status_code=503, content={"status": "unavailable"})


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/database", response_model=None)
def database_health(db: Session = Depends(get_db_session)) -> dict[str, str] | JSONResponse:
    try:
        check_database_connection(db)
    except SQLAlchemyError:
        return JSONResponse(status_code=503, content={"status": "unavailable"})

    return {"status": "ok"}
