from decimal import Decimal

from pydantic import BaseModel

DISCLAIMER = "Projections are hypothetical estimates and are not guaranteed."


class ProjectionRequest(BaseModel):
    """Input values for a compound-growth projection."""

    initial_amount: Decimal
    monthly_contribution: Decimal
    annual_return_rate: Decimal
    years: int


class YearlyBalanceResponse(BaseModel):
    """A projected balance at the end of a year."""

    year: int
    balance: str


class ProjectionResponse(BaseModel):
    """Response for a hypothetical compound-growth projection."""

    projected_balance: str
    total_contributions: str
    estimated_growth: str
    yearly_balances: list[YearlyBalanceResponse]
    disclaimer: str
