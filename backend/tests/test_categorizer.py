"""Tests for the rule-based categorizer service."""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from services.categorizer import categorize, CATEGORIAS_KEYWORDS


@pytest.mark.parametrize(
    "description,expected",
    [
        ("COTO CAPITAN", "Supermercado"),
        ("CARREFOUR EXPRESS", "Supermercado"),
        ("DIA %", "Supermercado"),
        ("CHANGOMAS FLORES", "Supermercado"),
        ("UBER TRIP", "Transporte"),
        ("CABIFY ARG", "Transporte"),
        ("SHELL NAFTA", "Transporte"),
        ("NETFLIX SUBSCRIPTION", "Entretenimiento"),
        ("SPOTIFY PREMIUM", "Entretenimiento"),
        ("STEAM PURCHASE", "Entretenimiento"),
        ("MCDONALDS DELIVERY", "Restaurantes"),
        ("STARBUCKS RECOLETA", "Restaurantes"),
        ("RAPPI FOOD", "Restaurantes"),
        ("FARMACITY BELGRANO", "Salud"),
        ("HOSPITAL ITALIANO", "Salud"),
        ("TELECOM INTERNET", "Servicios"),
        ("MOVISTAR TELEFONO", "Servicios"),
        ("ZARA SHOPPING", "Ropa"),
        ("NIKE STORE", "Ropa"),
        ("UNKNOWN MERCHANT", "Otros"),
        ("XYZ ABC 123", "Otros"),
        ("", "Otros"),
    ],
)
def test_categorize_known_descriptions(description, expected):
    """Categorize must return the expected category for known keywords."""
    assert categorize(description) == expected


def test_categorize_case_insensitive():
    """Categorization must be case-insensitive."""
    assert categorize("coto capitán") == "Supermercado"
    assert categorize("UBER TRIP") == "Transporte"
    assert categorize("NetFlIx") == "Entretenimiento"


def test_categorize_partial_match():
    """Keywords should match as substrings within descriptions."""
    assert categorize("PAGO MERPAGO*COTO EXTRA") == "Supermercado"
    assert categorize("UBER EATS RAPPI") == "Transporte"  # uber matches first


def test_all_categories_have_keywords():
    """Every category must have at least one keyword."""
    for category, keywords in CATEGORIAS_KEYWORDS.items():
        assert len(keywords) > 0, f"Category {category} has no keywords"


def test_categorize_returns_valid_category():
    """The returned category must exist in the keyword map or be 'Otros'."""
    result = categorize("some random text")
    assert result in list(CATEGORIAS_KEYWORDS.keys()) + ["Otros"]
