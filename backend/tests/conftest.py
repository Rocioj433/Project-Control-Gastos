"""Shared fixtures for the Control de Gastos test suite."""

import sys
from pathlib import Path

# Add parent directory to path so imports resolve when running pytest from tests/
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Patch database engine BEFORE importing main, so main.py uses in-memory DB
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

import database as _db_module
_db_module.engine = test_engine
_db_module.SessionLocal = TestingSessionLocal

from database import Base, get_db  # noqa: E402
from main import app  # noqa: E402
from models import Category, Expense  # noqa: E402


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh in-memory database for each test function."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with DB dependency overridden to in-memory SQLite."""
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()

    app.dependency_overrides[get_db] = override_get_db
    from starlette.testclient import TestClient
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def sample_expenses():
    """Sample expense dicts for parametrized tests."""
    return [
        {"date": "2024-06-15", "description": "COTO CAPITAN", "amount": 12500.50},
        {"date": "2024-06-16", "description": "UBER TRIP", "amount": 2300.00},
        {"date": "2024-06-17", "description": "NETFLIX SUBSCRIPTION", "amount": 4500.00},
        {"date": "2024-06-18", "description": "FARMACITY RECOLETA", "amount": 1800.25},
        {"date": "2024-06-19", "description": "ZARA SHOPPING", "amount": 56000.00},
        {"date": "2024-06-20", "description": "UNKNOWN MERCHANT", "amount": 999.99},
    ]


@pytest.fixture
def seeded_db(db_session):
    """Seed the in-memory DB with default categories and sample expenses."""
    categories = [
        Category(name="Supermercado", color="#4CAF50", icon="🛒"),
        Category(name="Transporte", color="#2196F3", icon="🚗"),
        Category(name="Entretenimiento", color="#9C27B0", icon="🎬"),
        Category(name="Restaurantes", color="#FF9800", icon="🍽️"),
        Category(name="Salud", color="#F44336", icon="🏥"),
        Category(name="Servicios", color="#00BCD4", icon="💡"),
        Category(name="Ropa", color="#E91E63", icon="👕"),
        Category(name="Otros", color="#607D8B", icon="📦"),
    ]
    db_session.add_all(categories)
    db_session.commit()

    expenses = [
        Expense(date="2024-06-15", description="COTO CAPITAN", amount=12500.50, source="test.pdf", category_id=1),
        Expense(date="2024-06-16", description="UBER TRIP", amount=2300.00, source="test.pdf", category_id=2),
        Expense(date="2024-06-17", description="NETFLIX SUBSCRIPTION", amount=4500.00, source="test.pdf", category_id=3),
    ]
    db_session.add_all(expenses)
    db_session.commit()

    yield db_session
