from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


POSTGRES_CONNECT_TIMEOUT_SECONDS = 5


def get_connect_args(database_url: str) -> dict[str, int]:
    url = make_url(database_url)

    if url.drivername.startswith("postgresql"):
        return {"connect_timeout": POSTGRES_CONNECT_TIMEOUT_SECONDS}

    return {}


settings = get_settings()
engine = create_engine(
    settings.database_url,
    connect_args=get_connect_args(settings.database_url),
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db_session() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_connection(db: Session) -> None:
    db.execute(text("SELECT 1"))
