from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, DateTime, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Uuid

from app.database.session import Base


def utc_now() -> datetime:
    return datetime.now(UTC)


class FinancialGoal(Base):
    __tablename__ = "financial_goals"
    __table_args__ = (
        CheckConstraint("length(name) > 0", name="ck_financial_goals_name_not_empty"),
        CheckConstraint("target_amount > 0", name="ck_financial_goals_target_positive"),
        CheckConstraint(
            "current_amount >= 0", name="ck_financial_goals_current_non_negative"
        ),
        CheckConstraint(
            "monthly_contribution >= 0",
            name="ck_financial_goals_monthly_non_negative",
        ),
        CheckConstraint(
            "annual_return_rate >= -100",
            name="ck_financial_goals_return_minimum",
        ),
        CheckConstraint(
            "years >= 1 AND years <= 80", name="ck_financial_goals_years_range"
        ),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    target_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    current_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    monthly_contribution: Mapped[Decimal] = mapped_column(
        Numeric(18, 2), nullable=False
    )
    annual_return_rate: Mapped[Decimal] = mapped_column(
        Numeric(10, 4), nullable=False
    )
    years: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )
