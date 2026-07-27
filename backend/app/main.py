from fastapi import FastAPI

from app.api.routes.projections import router as projections_router

app = FastAPI(title="InvestWise API")

app.include_router(projections_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
