from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP

MONEY_QUANT = Decimal("0.01")


@dataclass(frozen=True)
class YearlyBalance:
    """A rounded projected balance at the end of a year."""

    year: int
    balance: Decimal


@dataclass(frozen=True)
class ProjectionResult:
    """A hypothetical compound-growth projection."""

    projected_balance: Decimal
    total_contributions: Decimal
    estimated_growth: Decimal
    yearly_balances: list[YearlyBalance]


def calculate_projection(
    initial_amount: Decimal,
    monthly_contribution: Decimal,
    annual_return_rate: Decimal,
    years: int,
) -> ProjectionResult:
    """Calculate a hypothetical monthly-compounded investment projection."""

    _validate_inputs(
        initial_amount=initial_amount,
        monthly_contribution=monthly_contribution,
        annual_return_rate=annual_return_rate,
        years=years,
    )

    monthly_rate = (annual_return_rate / Decimal("100")) / Decimal("12")
    total_months = years * 12
    balance = initial_amount
    yearly_balances: list[YearlyBalance] = []

    for month in range(1, total_months + 1):
        balance += balance * monthly_rate
        balance += monthly_contribution

        if month % 12 == 0:
            yearly_balances.append(
                YearlyBalance(year=month // 12, balance=_round_money(balance))
            )

    projected_balance = _round_money(balance)
    total_contributions = _round_money(
        initial_amount + (monthly_contribution * Decimal(total_months))
    )
    estimated_growth = _round_money(projected_balance - total_contributions)

    return ProjectionResult(
        projected_balance=projected_balance,
        total_contributions=total_contributions,
        estimated_growth=estimated_growth,
        yearly_balances=yearly_balances,
    )


def _validate_inputs(
    initial_amount: Decimal,
    monthly_contribution: Decimal,
    annual_return_rate: Decimal,
    years: int,
) -> None:
    if initial_amount < Decimal("0"):
        raise ValueError("initial_amount cannot be negative")
    if monthly_contribution < Decimal("0"):
        raise ValueError("monthly_contribution cannot be negative")
    if annual_return_rate < Decimal("-100"):
        raise ValueError("annual_return_rate cannot be below -100")
    if years < 1:
        raise ValueError("years must be between 1 and 80")
    if years > 80:
        raise ValueError("years must be between 1 and 80")


def _round_money(value: Decimal) -> Decimal:
    return value.quantize(MONEY_QUANT, rounding=ROUND_HALF_UP)
