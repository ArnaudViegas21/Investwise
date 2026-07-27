from fastapi import APIRouter, HTTPException

from app.calculations.compound_growth import calculate_projection
from app.schemas.projections import (
    DISCLAIMER,
    ProjectionRequest,
    ProjectionResponse,
    YearlyBalanceResponse,
)

router = APIRouter(prefix="/api/v1", tags=["projections"])


@router.post("/projections", response_model=ProjectionResponse)
def create_projection(request: ProjectionRequest) -> ProjectionResponse:
    """Return a hypothetical compound-growth projection."""

    try:
        result = calculate_projection(
            initial_amount=request.initial_amount,
            monthly_contribution=request.monthly_contribution,
            annual_return_rate=request.annual_return_rate,
            years=request.years,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return ProjectionResponse(
        projected_balance=str(result.projected_balance),
        total_contributions=str(result.total_contributions),
        estimated_growth=str(result.estimated_growth),
        yearly_balances=[
            YearlyBalanceResponse(year=entry.year, balance=str(entry.balance))
            for entry in result.yearly_balances
        ],
        disclaimer=DISCLAIMER,
    )
