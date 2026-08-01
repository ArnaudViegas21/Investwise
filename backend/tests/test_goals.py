from collections.abc import Generator
from decimal import Decimal
from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.calculations.compound_growth import ProjectionResult, YearlyBalance
from app.database.session import Base, get_db_session
from app.main import app
from app.models import FinancialGoal


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session_local = sessionmaker(
        autocommit=False, autoflush=False, bind=engine
    )
    Base.metadata.create_all(bind=engine)

    def override_get_db_session() -> Generator[Session, None, None]:
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db_session] = override_get_db_session

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


def test_create_goal_returns_http_201(client: TestClient) -> None:
    response = client.post("/api/v1/goals", json=_valid_payload())

    assert response.status_code == 201
    assert response.json()["name"] == "Retirement bridge"


def test_created_goal_contains_id_and_timestamps(client: TestClient) -> None:
    response = client.post("/api/v1/goals", json=_valid_payload())
    body = response.json()

    assert response.status_code == 201
    assert UUID(body["id"])
    assert body["created_at"]
    assert body["updated_at"]


def test_list_goals_returns_saved_goals_newest_first(client: TestClient) -> None:
    first_response = client.post(
        "/api/v1/goals", json={**_valid_payload(), "name": "First goal"}
    )
    second_response = client.post(
        "/api/v1/goals", json={**_valid_payload(), "name": "Second goal"}
    )

    response = client.get("/api/v1/goals")

    assert first_response.status_code == 201
    assert second_response.status_code == 201
    assert response.status_code == 200
    assert [goal["name"] for goal in response.json()] == ["Second goal", "First goal"]


def test_fetch_one_goal_succeeds(client: TestClient) -> None:
    create_response = client.post("/api/v1/goals", json=_valid_payload())
    goal_id = create_response.json()["id"]

    response = client.get(f"/api/v1/goals/{goal_id}")

    assert response.status_code == 200
    assert response.json()["id"] == goal_id


def test_missing_goal_returns_http_404(client: TestClient) -> None:
    response = client.get(f"/api/v1/goals/{uuid4()}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Goal not found"


def test_partial_update_succeeds(client: TestClient) -> None:
    create_response = client.post("/api/v1/goals", json=_valid_payload())
    goal_id = create_response.json()["id"]

    response = client.patch(
        f"/api/v1/goals/{goal_id}",
        json={"name": "Updated goal", "monthly_contribution": "450.25"},
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Updated goal"
    assert response.json()["monthly_contribution"] == "450.25"
    assert response.json()["target_amount"] == "100000.00"


def test_invalid_update_returns_http_422(client: TestClient) -> None:
    create_response = client.post("/api/v1/goals", json=_valid_payload())
    goal_id = create_response.json()["id"]

    response = client.patch(f"/api/v1/goals/{goal_id}", json={"years": 81})

    assert response.status_code == 422


def test_delete_returns_http_204(client: TestClient) -> None:
    create_response = client.post("/api/v1/goals", json=_valid_payload())
    goal_id = create_response.json()["id"]

    response = client.delete(f"/api/v1/goals/{goal_id}")

    assert response.status_code == 204
    assert response.content == b""


def test_deleted_goal_subsequently_returns_http_404(client: TestClient) -> None:
    create_response = client.post("/api/v1/goals", json=_valid_payload())
    goal_id = create_response.json()["id"]
    client.delete(f"/api/v1/goals/{goal_id}")

    response = client.get(f"/api/v1/goals/{goal_id}")

    assert response.status_code == 404


def test_goal_projection_delegates_to_calculation_service(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    create_response = client.post("/api/v1/goals", json=_valid_payload())
    goal_id = create_response.json()["id"]
    called_with: dict[str, Decimal | int] = {}

    def fake_calculate_projection(
        initial_amount: Decimal,
        monthly_contribution: Decimal,
        annual_return_rate: Decimal,
        years: int,
    ) -> ProjectionResult:
        called_with["initial_amount"] = initial_amount
        called_with["monthly_contribution"] = monthly_contribution
        called_with["annual_return_rate"] = annual_return_rate
        called_with["years"] = years
        return ProjectionResult(
            projected_balance=Decimal("12000.00"),
            total_contributions=Decimal("9000.00"),
            estimated_growth=Decimal("3000.00"),
            yearly_balances=[YearlyBalance(year=1, balance=Decimal("12000.00"))],
        )

    monkeypatch.setattr(
        "app.services.financial_goals.calculate_projection",
        fake_calculate_projection,
    )

    response = client.get(f"/api/v1/goals/{goal_id}/projection")

    assert response.status_code == 200
    assert called_with == {
        "initial_amount": Decimal("10000.00"),
        "monthly_contribution": Decimal("300.00"),
        "annual_return_rate": Decimal("7.0000"),
        "years": 10,
    }
    assert response.json()["projected_balance"] == "12000.00"
    assert len(response.json()["yearly_balances"]) == 1


def test_decimal_values_retain_expected_precision(client: TestClient) -> None:
    response = client.post(
        "/api/v1/goals",
        json={
            **_valid_payload(),
            "target_amount": "123456.78",
            "current_amount": "1234.56",
            "monthly_contribution": "78.90",
            "annual_return_rate": "7.1234",
        },
    )

    assert response.status_code == 201
    assert response.json()["target_amount"] == "123456.78"
    assert response.json()["current_amount"] == "1234.56"
    assert response.json()["monthly_contribution"] == "78.90"
    assert response.json()["annual_return_rate"] == "7.1234"


def _valid_payload() -> dict[str, str | int]:
    return {
        "name": "Retirement bridge",
        "target_amount": "100000.00",
        "current_amount": "10000.00",
        "monthly_contribution": "300.00",
        "annual_return_rate": "7.0000",
        "years": 10,
    }
