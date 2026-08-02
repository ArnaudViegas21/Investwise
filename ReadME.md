# InvestWise

InvestWise is an educational personal-investing planning app. It helps users explore financial goals, compound growth, risk tolerance, and hypothetical portfolio allocations.

InvestWise does not recommend individual stocks, funds, cryptocurrencies, or trades. Results are hypothetical, not guaranteed, and are not professional financial advice.

## Backend Setup

Requires Python 3.11 or newer.

From the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Run the FastAPI development server:

```powershell
uvicorn app.main:app --reload
```

Run backend tests:

```powershell
pytest
```

## Local Database

Start PostgreSQL:

```powershell
docker compose up -d
docker compose ps
```

Apply database migrations and run the API:

```powershell
cd backend
python -m alembic upgrade head
python -m uvicorn app.main:app --reload
```

Stop PostgreSQL:

```powershell
docker compose down
```

To stop PostgreSQL and delete local database data, run:

```powershell
docker compose down -v
```
