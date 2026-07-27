from decimal import Decimal

import pytest

from app.calculations.compound_growth import calculate_projection


def test_zero_annual_return_equals_initial_plus_contributions() -> None:
    result = calculate_projection(
        initial_amount=Decimal("1000"),
        monthly_contribution=Decimal("100"),
        annual_return_rate=Decimal("0"),
        years=2,
    )

    assert result.projected_balance == Decimal("3400.00")
    assert result.total_contributions == Decimal("3400.00")
    assert result.estimated_growth == Decimal("0.00")


def test_zero_monthly_contribution_compounds_initial_amount() -> None:
    result = calculate_projection(
        initial_amount=Decimal("1000"),
        monthly_contribution=Decimal("0"),
        annual_return_rate=Decimal("12"),
        years=1,
    )

    assert result.projected_balance == Decimal("1126.83")
    assert result.total_contributions == Decimal("1000.00")
    assert result.estimated_growth == Decimal("126.83")


def test_normal_projection_returns_expected_values() -> None:
    result = calculate_projection(
        initial_amount=Decimal("5000"),
        monthly_contribution=Decimal("250"),
        annual_return_rate=Decimal("7"),
        years=10,
    )

    assert result.projected_balance == Decimal("53319.51")
    assert result.total_contributions == Decimal("35000.00")
    assert result.estimated_growth == Decimal("18319.51")


def test_negative_initial_amount_raises_value_error() -> None:
    with pytest.raises(ValueError, match="initial_amount cannot be negative"):
        calculate_projection(Decimal("-1"), Decimal("100"), Decimal("7"), 10)


def test_negative_monthly_contribution_raises_value_error() -> None:
    with pytest.raises(ValueError, match="monthly_contribution cannot be negative"):
        calculate_projection(Decimal("1000"), Decimal("-1"), Decimal("7"), 10)


def test_annual_return_below_minus_100_raises_value_error() -> None:
    with pytest.raises(ValueError, match="annual_return_rate cannot be below -100"):
        calculate_projection(Decimal("1000"), Decimal("100"), Decimal("-100.01"), 10)


def test_years_below_1_raises_value_error() -> None:
    with pytest.raises(ValueError, match="years must be between 1 and 80"):
        calculate_projection(Decimal("1000"), Decimal("100"), Decimal("7"), 0)


def test_years_above_80_raises_value_error() -> None:
    with pytest.raises(ValueError, match="years must be between 1 and 80"):
        calculate_projection(Decimal("1000"), Decimal("100"), Decimal("7"), 81)


def test_yearly_balances_contains_one_entry_per_year() -> None:
    result = calculate_projection(
        initial_amount=Decimal("1000"),
        monthly_contribution=Decimal("100"),
        annual_return_rate=Decimal("7"),
        years=5,
    )

    assert len(result.yearly_balances) == 5
    assert [entry.year for entry in result.yearly_balances] == [1, 2, 3, 4, 5]


def test_projected_balance_equals_contributions_plus_growth() -> None:
    result = calculate_projection(
        initial_amount=Decimal("5000"),
        monthly_contribution=Decimal("250"),
        annual_return_rate=Decimal("7"),
        years=10,
    )

    assert result.projected_balance == (
        result.total_contributions + result.estimated_growth
    )
