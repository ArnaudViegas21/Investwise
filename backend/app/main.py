from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.goals import router as goals_router
from app.api.routes.projections import router as projections_router

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


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
