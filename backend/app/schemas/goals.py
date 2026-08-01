from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_serializer,
    field_validator,
    model_validator,
)

MONEY_QUANT = Decimal("0.01")
RATE_QUANT = Decimal("0.0001")


class FinancialGoalBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    target_amount: Decimal = Field(..., gt=Decimal("0"))
    current_amount: Decimal = Field(..., ge=Decimal("0"))
    monthly_contribution: Decimal = Field(..., ge=Decimal("0"))
    annual_return_rate: Decimal = Field(..., ge=Decimal("-100"))
    years: int = Field(..., ge=1, le=80)

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("name must not be blank")
        return stripped


class FinancialGoalCreate(FinancialGoalBase):
    pass


class FinancialGoalUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    target_amount: Decimal | None = Field(default=None, gt=Decimal("0"))
    current_amount: Decimal | None = Field(default=None, ge=Decimal("0"))
    monthly_contribution: Decimal | None = Field(default=None, ge=Decimal("0"))
    annual_return_rate: Decimal | None = Field(default=None, ge=Decimal("-100"))
    years: int | None = Field(default=None, ge=1, le=80)

    @model_validator(mode="before")
    @classmethod
    def supplied_values_must_not_be_null(cls, data: object) -> object:
        if isinstance(data, dict) and any(value is None for value in data.values()):
            raise ValueError("supplied values must not be null")
        return data

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, value: str | None) -> str | None:
        if value is None:
            return None

        stripped = value.strip()
        if not stripped:
            raise ValueError("name must not be blank")
        return stripped


class FinancialGoalResponse(FinancialGoalBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("target_amount", "current_amount", "monthly_contribution")
    def serialize_money(self, value: Decimal) -> str:
        return str(value.quantize(MONEY_QUANT))

    @field_serializer("annual_return_rate")
    def serialize_rate(self, value: Decimal) -> str:
        return str(value.quantize(RATE_QUANT))
