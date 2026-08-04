import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), "..", "service_account.json")


def get_sheets_service():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    return build("sheets", "v4", credentials=creds)


def sync_expenses_to_sheet(spreadsheet_id: str, expenses: list[dict]) -> dict:
    service = get_sheets_service()

    header = [["Fecha", "Descripcion", "Monto", "Categoria", "Fuente"]]

    rows = [
        [e["date"], e["description"], e["amount"], e.get("category", "Otros"), e.get("source", "")]
        for e in expenses
    ]

    service.spreadsheets().values().clear(
        spreadsheetId=spreadsheet_id, range="A1:Z"
    ).execute()

    service.spreadsheets().values().update(
        spreadsheetId=spreadsheet_id,
        range="A1",
        valueInputOption="RAW",
        body={"values": header + rows},
    ).execute()

    return {"synced": len(rows), "spreadsheet_id": spreadsheet_id}
