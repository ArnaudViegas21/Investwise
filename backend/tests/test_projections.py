from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_valid_projection_request_returns_http_200() -> None:
    response = client.post("/api/v1/projections", json=_valid_payload())

    assert response.status_code == 200


def test_projection_response_includes_required_fields() -> None:
    response = client.post("/api/v1/projections", json=_valid_payload())

    assert response.status_code == 200
    assert set(response.json()) == {
        "projected_balance",
        "total_contributions",
        "estimated_growth",
        "yearly_balances",
        "disclaimer",
    }


def test_zero_annual_return_returns_expected_result() -> None:
    response = client.post(
        "/api/v1/projections",
        json={
            "initial_amount": "1000",
            "monthly_contribution": "100",
            "annual_return_rate": "0",
            "years": 2,
        },
    )

    assert response.status_code == 200
    assert response.json()["projected_balance"] == "3400.00"
    assert response.json()["total_contributions"] == "3400.00"
    assert response.json()["estimated_growth"] == "0.00"


def test_negative_initial_amount_returns_client_error() -> None:
    payload = _valid_payload()
    payload["initial_amount"] = "-1"

    response = client.post("/api/v1/projections", json=payload)

    assert response.status_code == 400
    assert response.json()["detail"] == "initial_amount cannot be negative"


def test_negative_monthly_contribution_returns_client_error() -> None:
    payload = _valid_payload()
    payload["monthly_contribution"] = "-1"

    response = client.post("/api/v1/projections", json=payload)

    assert response.status_code == 400
    assert response.json()["detail"] == "monthly_contribution cannot be negative"


def test_invalid_years_returns_client_error() -> None:
    payload = _valid_payload()
    payload["years"] = 0

    response = client.post("/api/v1/projections", json=payload)

    assert response.status_code == 400
    assert response.json()["detail"] == "years must be between 1 and 80"


def test_invalid_pydantic_input_returns_http_422() -> None:
    payload = _valid_payload()
    payload["years"] = "not-a-number"

    response = client.post("/api/v1/projections", json=payload)

    assert response.status_code == 422


def test_yearly_balances_contains_one_entry_per_year() -> None:
    response = client.post("/api/v1/projections", json={**_valid_payload(), "years": 5})

    assert response.status_code == 200
    assert len(response.json()["yearly_balances"]) == 5


def test_disclaimer_is_included() -> None:
    response = client.post("/api/v1/projections", json=_valid_payload())

    assert response.status_code == 200
    assert "hypothetical estimates" in response.json()["disclaimer"]
    assert "not guaranteed" in response.json()["disclaimer"]


def test_health_still_returns_http_200() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def _valid_payload() -> dict[str, str | int]:
    return {
        "initial_amount": "5000",
        "monthly_contribution": "250",
        "annual_return_rate": "7",
        "years": 10,
    }
