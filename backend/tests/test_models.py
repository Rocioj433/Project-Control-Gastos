"""Tests for SQLAlchemy models."""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from models import Category, Expense


def test_create_category(db_session):
    """A category can be created and retrieved."""
    cat = Category(name="TestCat", color="#FFFFFF", icon="🧪")
    db_session.add(cat)
    db_session.commit()

    retrieved = db_session.query(Category).filter_by(name="TestCat").first()
    assert retrieved is not None
    assert retrieved.color == "#FFFFFF"
    assert retrieved.icon == "🧪"


def test_category_unique_name(db_session):
    """Category names must be unique."""
    cat1 = Category(name="Unique")
    db_session.add(cat1)
    db_session.commit()

    cat2 = Category(name="Unique")
    db_session.add(cat2)
    with pytest.raises(Exception):  # IntegrityError
        db_session.commit()


def test_create_expense(db_session):
    """An expense can be created with all fields."""
    expense = Expense(
        date="2024-06-15",
        description="TEST",
        amount=999.99,
        source="test.pdf",
    )
    db_session.add(expense)
    db_session.commit()

    retrieved = db_session.query(Expense).first()
    assert retrieved.description == "TEST"
    assert retrieved.amount == 999.99


def test_expense_category_relationship(db_session):
    """An expense can be linked to a category via relationship."""
    cat = Category(name="RelTest", color="#000000", icon="🔗")
    db_session.add(cat)
    db_session.commit()

    exp = Expense(
        date="2024-06-15",
        description="LINKED",
        amount=100,
        category_id=cat.id,
    )
    db_session.add(exp)
    db_session.commit()

    retrieved = db_session.query(Expense).first()
    assert retrieved.category is not None
    assert retrieved.category.name == "RelTest"


def test_expense_without_category(db_session):
    """An expense without category_id should have category=None."""
    exp = Expense(date="2024-06-15", description="ORPHAN", amount=50)
    db_session.add(exp)
    db_session.commit()

    retrieved = db_session.query(Expense).first()
    assert retrieved.category is None


def test_category_expenses_backref(db_session):
    """Category.expenses must list all linked expenses."""
    cat = Category(name="Backref")
    db_session.add(cat)
    db_session.commit()

    for i in range(3):
        db_session.add(Expense(date="2024-06-15", description=f"EXP{i}", amount=10, category_id=cat.id))
    db_session.commit()

    retrieved = db_session.query(Category).filter_by(name="Backref").first()
    assert len(retrieved.expenses) == 3


def test_expense_required_fields(db_session):
    """Expense date, description and amount should not be nullable."""
    exp = Expense()
    db_session.add(exp)
    with pytest.raises(Exception):
        db_session.commit()
