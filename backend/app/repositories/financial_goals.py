from collections.abc import Sequence
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.financial_goal import FinancialGoal
from app.schemas.goals import FinancialGoalCreate, FinancialGoalUpdate


def create_goal(db: Session, goal: FinancialGoalCreate) -> FinancialGoal:
    db_goal = FinancialGoal(**goal.model_dump())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal


def list_goals(db: Session) -> Sequence[FinancialGoal]:
    statement = select(FinancialGoal).order_by(FinancialGoal.created_at.desc())
    return db.scalars(statement).all()


def get_goal(db: Session, goal_id: UUID) -> FinancialGoal | None:
    return db.get(FinancialGoal, goal_id)


def update_goal(
    db: Session, db_goal: FinancialGoal, goal_update: FinancialGoalUpdate
) -> FinancialGoal:
    update_data = goal_update.model_dump(exclude_unset=True)

    for field_name, value in update_data.items():
        setattr(db_goal, field_name, value)

    if update_data:
        db_goal.updated_at = datetime.now(UTC)

    db.commit()
    db.refresh(db_goal)
    return db_goal


def delete_goal(db: Session, db_goal: FinancialGoal) -> None:
    db.delete(db_goal)
    db.commit()
