"""Tests for PDF text extraction and expense parsing."""

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from services import extract_text_from_pdf, parse_expenses, convert_date


class FakePage:
    """Mock pdfplumber page for testing."""
    def __init__(self, text):
        self._text = text

    def extract_text(self):
        return self._text


class FakePDF:
    """Mock pdfplumber PDF for testing."""
    def __init__(self, pages_text):
        self.pages = [FakePage(t) for t in pages_text]

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass


# --- convert_date ---

@pytest.mark.parametrize(
    "input_date,expected",
    [
        ("15-Jun-24", "2024-06-15"),
        ("01-Ene-23", "2023-01-01"),
        ("31-Dic-99", "2099-12-31"),
        ("28-Feb-20", "2020-02-28"),
    ],
)
def test_convert_date(input_date, expected):
    """convert_date must parse DD-Mmm-YY to YYYY-MM-DD."""
    assert convert_date(input_date) == expected


def test_convert_date_unknown_month_defaults():
    """Unknown month abbreviations default to '01'."""
    assert convert_date("15-Xyz-24") == "2024-01-15"


# --- extract_text_from_pdf ---

@patch("services.pdfplumber.open")
def test_extract_text_from_pdf_single_page(mock_open):
    """Extract text from a one-page PDF."""
    mock_open.return_value = FakePDF(["Hello world"])
    result = extract_text_from_pdf(b"fake pdf bytes")
    assert result == "Hello world\n"


@patch("services.pdfplumber.open")
def test_extract_text_from_pdf_multiple_pages(mock_open):
    """Concatenate text from all pages."""
    mock_open.return_value = FakePDF(["Page one", "Page two"])
    result = extract_text_from_pdf(b"fake pdf bytes")
    assert result == "Page one\nPage two\n"


@patch("services.pdfplumber.open")
def test_extract_text_from_pdf_empty_page(mock_open):
    """Handle pages with no extractable text gracefully."""
    mock_open.return_value = FakePDF(["First page", None, "Third page"])
    result = extract_text_from_pdf(b"fake pdf bytes")
    assert result == "First page\nThird page\n"


# --- parse_expenses ---
# NOTE: The parser expects Argentine number format: 12.500,50 (dot thousands, comma decimal)

SAMPLE_PDF_TEXT = """
15-Jun-24 COTO CAPITAN          12.500,50
16-Jun-24 UBER TRIP              2.300,00
16-Jun-24 SU PAGO             -50.000,00
17-Jun-24 NETFLIX SUBSCRIPTION   4.500,00
18-Jun-24 FARMACITY RECOLETA 12345 1.800,25
INVALID LINE WITHOUT DATE
"""


def test_parse_expenses_extracts_valid_lines():
    """Parse only lines with valid date + amount format."""
    result = parse_expenses(SAMPLE_PDF_TEXT)
    assert len(result) == 4


def test_parse_expenses_skips_payment_lines():
    """Lines containing 'SU PAGO' must be skipped."""
    result = parse_expenses(SAMPLE_PDF_TEXT)
    descriptions = [r["description"] for r in result]
    assert "SU PAGO" not in descriptions


def test_parse_expenses_parses_amounts_correctly():
    """Amounts with Argentine format (dot thousand, comma decimal) parse as float."""
    result = parse_expenses(SAMPLE_PDF_TEXT)
    coto = next(r for r in result if "COTO" in r["description"])
    assert coto["amount"] == 12500.50


def test_parse_expenses_strips_reference_numbers():
    """Trailing 5-digit reference numbers should be removed from description."""
    result = parse_expenses(SAMPLE_PDF_TEXT)
    farmacity = next(r for r in result if "FARMACITY" in r["description"])
    assert farmacity["description"] == "FARMACITY RECOLETA"
    assert farmacity["amount"] == 1800.25


def test_parse_expenses_strips_parentheses():
    """Content in parentheses should be removed from description."""
    text = "20-Jun-24 SOME STORE (EXTRA INFO)    1.000,00"
    result = parse_expenses(text)
    assert result[0]["description"] == "SOME STORE"


def test_parse_expenses_returns_empty_for_no_matches():
    """Text with no valid expense lines returns an empty list."""
    result = parse_expenses("No dates here\nAnother invalid line")
    assert result == []


def test_parse_expenses_date_format():
    """Parsed dates must be in ISO YYYY-MM-DD format."""
    result = parse_expenses("15-Jun-24 TEST    1.000,00")
    assert result[0]["date"] == "2024-06-15"


def test_parse_expenses_no_dot_thousands():
    """Amounts without dot thousands are parsed partially (last 3 digits before comma)."""
    # This documents the actual parser behavior with non-standard input
    result = parse_expenses("15-Jun-24 MERCADO    12500,50")
    assert len(result) == 1
    assert result[0]["amount"] == 500.50  # parser takes "500,50" as the amount
