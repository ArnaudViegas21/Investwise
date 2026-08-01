"""create financial goals

Revision ID: 20260731_0001
Revises:
Create Date: 2026-07-31
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260731_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "financial_goals",
        sa.Column("id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("target_amount", sa.Numeric(18, 2), nullable=False),
        sa.Column("current_amount", sa.Numeric(18, 2), nullable=False),
        sa.Column("monthly_contribution", sa.Numeric(18, 2), nullable=False),
        sa.Column("annual_return_rate", sa.Numeric(10, 4), nullable=False),
        sa.Column("years", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("length(name) > 0", name="ck_financial_goals_name_not_empty"),
        sa.CheckConstraint("target_amount > 0", name="ck_financial_goals_target_positive"),
        sa.CheckConstraint(
            "current_amount >= 0", name="ck_financial_goals_current_non_negative"
        ),
        sa.CheckConstraint(
            "monthly_contribution >= 0",
            name="ck_financial_goals_monthly_non_negative",
        ),
        sa.CheckConstraint(
            "annual_return_rate >= -100", name="ck_financial_goals_return_minimum"
        ),
        sa.CheckConstraint(
            "years >= 1 AND years <= 80", name="ck_financial_goals_years_range"
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("financial_goals")
