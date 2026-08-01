from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database.session import get_db_session
from app.schemas.goals import (
    FinancialGoalCreate,
    FinancialGoalResponse,
    FinancialGoalUpdate,
)
from app.schemas.projections import ProjectionResponse
from app.services import financial_goals as goals_service

router = APIRouter(prefix="/api/v1", tags=["goals"])


@router.post(
    "/goals",
    response_model=FinancialGoalResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_goal(
    goal: FinancialGoalCreate, db: Session = Depends(get_db_session)
) -> FinancialGoalResponse:
    return FinancialGoalResponse.model_validate(goals_service.create_goal(db, goal))


@router.get("/goals", response_model=list[FinancialGoalResponse])
def list_goals(db: Session = Depends(get_db_session)) -> list[FinancialGoalResponse]:
    return [
        FinancialGoalResponse.model_validate(goal)
        for goal in goals_service.list_goals(db)
    ]


@router.get("/goals/{goal_id}", response_model=FinancialGoalResponse)
def get_goal(
    goal_id: UUID, db: Session = Depends(get_db_session)
) -> FinancialGoalResponse:
    try:
        goal = goals_service.get_goal(db, goal_id)
    except goals_service.GoalNotFoundError as exc:
        raise _not_found() from exc

    return FinancialGoalResponse.model_validate(goal)


@router.patch("/goals/{goal_id}", response_model=FinancialGoalResponse)
def update_goal(
    goal_id: UUID,
    goal_update: FinancialGoalUpdate,
    db: Session = Depends(get_db_session),
) -> FinancialGoalResponse:
    try:
        goal = goals_service.update_goal(db, goal_id, goal_update)
    except goals_service.GoalNotFoundError as exc:
        raise _not_found() from exc

    return FinancialGoalResponse.model_validate(goal)


@router.delete("/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: UUID, db: Session = Depends(get_db_session)) -> Response:
    try:
        goals_service.delete_goal(db, goal_id)
    except goals_service.GoalNotFoundError as exc:
        raise _not_found() from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/goals/{goal_id}/projection", response_model=ProjectionResponse)
def project_goal(
    goal_id: UUID, db: Session = Depends(get_db_session)
) -> ProjectionResponse:
    try:
        return goals_service.project_goal(db, goal_id)
    except goals_service.GoalNotFoundError as exc:
        raise _not_found() from exc


def _not_found() -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
