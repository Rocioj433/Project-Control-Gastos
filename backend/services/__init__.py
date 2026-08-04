import re
import pdfplumber
import io
from datetime import datetime


MONTH_MAP = {
    "Ene": "01", "Feb": "02", "Mar": "03", "Abr": "04",
    "May": "05", "Jun": "06", "Jul": "07", "Ago": "08",
    "Sep": "09", "Oct": "10", "Nov": "11", "Dic": "12",
}


def convert_date(date_str: str) -> str:
    parts = date_str.split("-")
    day = parts[0]
    month = MONTH_MAP.get(parts[1], "01")
    year = "20" + parts[2]
    return f"{year}-{month}-{day}"


def extract_text_from_pdf(file_bytes: bytes) -> str:
    texto = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                texto += page_text + "\n"
    return texto


def parse_expenses(text: str) -> list[dict]:
    expenses = []
    lines = text.split("\n")

    date_pattern = re.compile(r"^\d{2}-[A-Za-z]{3}-\d{2}")

    for line in lines:
        line = line.strip()

        if not date_pattern.match(line):
            continue

        if "SU PAGO" in line:
            continue

        match = re.match(r"^(\d{2}-[A-Za-z]{3}-\d{2})\s+(.*)", line)
        if not match:
            continue

        date = convert_date(match.group(1))
        rest = match.group(2).strip()

        amount_match = re.search(r"(\d{1,3}(?:\.\d{3})*,\d{2})\s*$", rest)
        if not amount_match:
            continue

        amount_str = amount_match.group(1)
        rest_before_amount = rest[: amount_match.start()].strip()

        ref_match = re.search(r"\s(\d{5})\s*$", rest_before_amount)
        if ref_match:
            description = rest_before_amount[: ref_match.start()].strip()
        else:
            description = rest_before_amount

        description = re.sub(r"\s*\(.*?\)\s*", " ", description).strip()

        amount = float(amount_str.replace(".", "").replace(",", "."))

        expenses.append({
            "date": date,
            "description": description,
            "amount": amount,
        })

    return expenses
