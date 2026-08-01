from collections.abc import Sequence
from uuid import UUID

from sqlalchemy.orm import Session

from app.calculations.compound_growth import calculate_projection
from app.models.financial_goal import FinancialGoal
from app.repositories import financial_goals as goals_repository
from app.schemas.goals import FinancialGoalCreate, FinancialGoalUpdate
from app.schemas.projections import (
    DISCLAIMER,
    ProjectionResponse,
    YearlyBalanceResponse,
)


class GoalNotFoundError(Exception):
    pass


def create_goal(db: Session, goal: FinancialGoalCreate) -> FinancialGoal:
    return goals_repository.create_goal(db, goal)


def list_goals(db: Session) -> Sequence[FinancialGoal]:
    return goals_repository.list_goals(db)


def get_goal(db: Session, goal_id: UUID) -> FinancialGoal:
    goal = goals_repository.get_goal(db, goal_id)
    if goal is None:
        raise GoalNotFoundError
    return goal


def update_goal(
    db: Session, goal_id: UUID, goal_update: FinancialGoalUpdate
) -> FinancialGoal:
    goal = get_goal(db, goal_id)
    return goals_repository.update_goal(db, goal, goal_update)


def delete_goal(db: Session, goal_id: UUID) -> None:
    goal = get_goal(db, goal_id)
    goals_repository.delete_goal(db, goal)


def project_goal(db: Session, goal_id: UUID) -> ProjectionResponse:
    goal = get_goal(db, goal_id)
    result = calculate_projection(
        initial_amount=goal.current_amount,
        monthly_contribution=goal.monthly_contribution,
        annual_return_rate=goal.annual_return_rate,
        years=goal.years,
    )

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
