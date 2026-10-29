"""Integration tests for FastAPI endpoints."""

import sys
from pathlib import Path
from unittest.mock import patch

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from models import Category, Expense


# --- Root ---

def test_read_root(client):
    """GET / must return the API status message."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"mensaje": "API Control de Gastos funcionando"}


# --- Procesar resumen ---

def test_procesar_resumen_rejects_non_pdf(client):
    """POST /procesar-resumen/ must reject non-PDF files."""
    response = client.post(
        "/procesar-resumen/",
        files={"file": ("test.txt", b"not a pdf", "text/plain")},
    )
    assert response.status_code == 200
    assert response.json()["error"] == "Por favor, sube un archivo PDF."


@patch("main.extract_text_from_pdf", return_value="15-Jun-24 COTO    1000,00")
@patch("main.parse_expenses", return_value=[{"date": "2024-06-15", "description": "COTO", "amount": 1000.0}])
def test_procesar_resumen_parses_pdf(mock_parse, mock_extract, client, seeded_db):
    """POST /procesar-resumen/ must parse PDF and store expenses."""
    response = client.post(
        "/procesar-resumen/",
        files={"file": ("resumen.pdf", b"fake pdf", "application/pdf")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_en_pdf"] == 1
    assert data["nuevos"] == 1
    assert data["duplicados"] == 0


@patch("main.extract_text_from_pdf", return_value="15-Jun-24 COTO    1000,00")
@patch("main.parse_expenses", return_value=[{"date": "2024-06-15", "description": "COTO", "amount": 1000.0}])
def test_procesar_resumen_detects_duplicates(mock_parse, mock_extract, client, seeded_db):
    """Re-processing the same file must mark expenses as duplicates."""
    client.post(
        "/procesar-resumen/",
        files={"file": ("resumen.pdf", b"fake pdf", "application/pdf")},
    )
    response = client.post(
        "/procesar-resumen/",
        files={"file": ("resumen.pdf", b"fake pdf", "application/pdf")},
    )
    data = response.json()
    assert data["duplicados"] == 1


# --- Listar gastos ---

def test_listar_gastos_empty(client):
    """GET /gastos/ with empty DB returns total 0."""
    response = client.get("/gastos/")
    assert response.status_code == 200
    assert response.json()["total"] == 0


def test_listar_gastos_with_data(client, seeded_db):
    """GET /gastos/ returns seeded expenses."""
    response = client.get("/gastos/")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert data["gastos"][0]["description"] == "NETFLIX SUBSCRIPTION"


def test_listar_gastos_filter_by_month(client, seeded_db):
    """GET /gastos/?month=2024-06 filters by month."""
    response = client.get("/gastos/?month=2024-06")
    assert response.status_code == 200
    assert response.json()["total"] == 3


def test_listar_gastos_filter_by_category(client, seeded_db):
    """GET /gastos/?category=Supermercado filters by category name."""
    response = client.get("/gastos/?category=Supermercado")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["gastos"][0]["category"] == "Supermercado"


# --- Resumen ---

def test_resumen_mensual_empty(client):
    """GET /resumen/ with no data returns 0 total."""
    response = client.get("/resumen/")
    assert response.status_code == 200
    assert response.json()["total_general"] == 0


def test_resumen_mensual_with_data(client, seeded_db):
    """GET /resumen/ aggregates expenses by category."""
    response = client.get("/resumen/")
    assert response.status_code == 200
    data = response.json()
    assert data["total_general"] == 19300.50  # 12500.50 + 2300 + 4500
    assert len(data["por_categoria"]) == 3


# --- Exportar Excel ---

def test_exportar_excel_returns_file(client, seeded_db):
    """GET /exportar-excel/ must return an .xlsx file."""
    response = client.get("/exportar-excel/")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert "gastos_todos.xlsx" in response.headers["content-disposition"]


def test_exportar_excel_with_month_filter(client, seeded_db):
    """GET /exportar-excel/?month=2024-06 must filter by month."""
    response = client.get("/exportar-excel/?month=2024-06")
    assert response.status_code == 200
    assert "gastos_2024-06.xlsx" in response.headers["content-disposition"]


# --- Reporte mensual ---

def test_reporte_mensual_requires_month(client):
    """GET /reporte-mensual/ without month param must fail validation."""
    response = client.get("/reporte-mensual/")
    assert response.status_code == 422


def test_reporte_mensual_empty_month(client):
    """GET /reporte-mensual/?month=2024-01 with no data."""
    response = client.get("/reporte-mensual/?month=2024-01")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["cantidad_gastos"] == 0


def test_reporte_mensual_with_data(client, seeded_db):
    """GET /reporte-mensual/?month=2024-06 returns computed stats."""
    response = client.get("/reporte-mensual/?month=2024-06")
    assert response.status_code == 200
    data = response.json()
    assert data["month"] == "2024-06"
    assert data["total"] == 19300.50
    assert data["cantidad_gastos"] == 3
    assert "variacion" in data
    assert "promedio_diario" in data
    assert len(data["top_gastos"]) <= 5


# --- Categorizar IA ---

@patch("main.categorize_with_ai", return_value=[
    {"description": "COTO CAPITAN", "category": "Supermercado"},
    {"description": "UBER TRIP", "category": "Transporte"},
    {"description": "NETFLIX SUBSCRIPTION", "category": "Entretenimiento"},
])
def test_categorizar_ia_updates_categories(mock_ai, client, seeded_db):
    """POST /categorizar-ia/ must call AI and update categories."""
    response = client.post("/categorizar-ia/")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert data["actualizados"] >= 0


def test_categorizar_ia_no_expenses(client):
    """POST /categorizar-ia/ with empty DB returns a message."""
    response = client.post("/categorizar-ia/")
    assert response.status_code == 200
    assert response.json()["message"] == "No hay gastos para categorizar"
