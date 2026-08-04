from fastapi import FastAPI, UploadFile, File, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import engine, get_db, Base
from models import Category, Expense
from services import extract_text_from_pdf, parse_expenses
from services.categorizer import categorize
from services.excel_service import generate_excel
from services.ai_categorizer import categorize_with_ai
from services.report_service import get_monthly_report

Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Control de Gastos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    db = next(get_db())
    categorias_default = [
        {"name": "Supermercado", "color": "#4CAF50", "icon": "🛒"},
        {"name": "Transporte", "color": "#2196F3", "icon": "🚗"},
        {"name": "Entretenimiento", "color": "#9C27B0", "icon": "🎬"},
        {"name": "Restaurantes", "color": "#FF9800", "icon": "🍽️"},
        {"name": "Salud", "color": "#F44336", "icon": "🏥"},
        {"name": "Servicios", "color": "#00BCD4", "icon": "💡"},
        {"name": "Ropa", "color": "#E91E63", "icon": "👕"},
        {"name": "Otros", "color": "#607D8B", "icon": "📦"},
    ]
    for cat in categorias_default:
        existe = db.query(Category).filter(Category.name == cat["name"]).first()
        if not existe:
            db.add(Category(**cat))
    db.commit()


@app.get("/")
def read_root():
    return {"mensaje": "API Control de Gastos funcionando"}


@app.post("/procesar-resumen/")
async def procesar_resumen(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".pdf"):
        return {"error": "Por favor, sube un archivo PDF."}

    contenido = await file.read()
    texto = extract_text_from_pdf(contenido)
    gastos_parseados = parse_expenses(texto)

    nuevos = []
    duplicados = []

    for g in gastos_parseados:
        existente = (
            db.query(Expense)
            .filter(
                Expense.date == g["date"],
                Expense.description == g["description"],
                Expense.amount == g["amount"],
                Expense.source == file.filename,
            )
            .first()
        )

        if existente:
            duplicados.append({
                "date": g["date"],
                "description": g["description"],
                "amount": g["amount"],
            })
            continue

        cat_name = categorize(g["description"])
        cat = db.query(Category).filter(Category.name == cat_name).first()

        expense = Expense(
            date=g["date"],
            description=g["description"],
            amount=g["amount"],
            source=file.filename,
            category_id=cat.id if cat else None,
        )
        db.add(expense)
        nuevos.append({
            "date": g["date"],
            "description": g["description"],
            "amount": g["amount"],
            "category": cat_name,
        })

    db.commit()

    return {
        "nombre_archivo": file.filename,
        "total_en_pdf": len(gastos_parseados),
        "nuevos": len(nuevos),
        "duplicados": len(duplicados),
        "gastos": nuevos,
    }


@app.get("/gastos/")
def listar_gastos(
    month: str = Query(None, description="Mes en formato YYYY-MM"),
    category: str = Query(None, description="Nombre de categoria"),
    db: Session = Depends(get_db),
):
    query = db.query(Expense).join(Category, isouter=True)

    if month:
        query = query.filter(Expense.date.like(f"%{month}%"))

    if category:
        query = query.filter(Category.name == category)

    gastos = query.order_by(Expense.date.desc()).all()

    return {
        "total": len(gastos),
        "gastos": [
            {
                "id": g.id,
                "date": g.date,
                "description": g.description,
                "amount": g.amount,
                "category": g.category.name if g.category else "Sin categoria",
                "source": g.source,
            }
            for g in gastos
        ],
    }


@app.get("/resumen/")
def resumen_mensual(db: Session = Depends(get_db)):
    resultado = (
        db.query(
            Category.name.label("categoria"),
            Category.color.label("color"),
            Category.icon.label("icon"),
            func.sum(Expense.amount).label("total"),
            func.count(Expense.id).label("cantidad"),
        )
        .join(Category, Expense.category_id == Category.id, isouter=True)
        .group_by(Category.name, Category.color, Category.icon)
        .all()
    )

    total_general = sum(r.total or 0 for r in resultado)

    return {
        "total_general": total_general,
        "por_categoria": [
            {
                "categoria": r.categoria or "Sin categoria",
                "color": r.color,
                "icon": r.icon,
                "total": r.total or 0,
                "cantidad": r.cantidad,
                "porcentaje": round((r.total or 0) / total_general * 100, 1) if total_general > 0 else 0,
            }
            for r in resultado
        ],
    }


@app.get("/exportar-excel/")
def exportar_excel(
    month: str = Query(None, description="Mes en formato YYYY-MM"),
    db: Session = Depends(get_db),
):
    query = db.query(Expense).join(Category, isouter=True)

    if month:
        query = query.filter(Expense.date.like(f"%{month}%"))

    gastos = query.order_by(Expense.date.desc()).all()

    expenses_data = [
        {
            "date": g.date,
            "description": g.description,
            "amount": g.amount,
            "category": g.category.name if g.category else "Sin categoria",
            "source": g.source,
        }
        for g in gastos
    ]

    excel_bytes = generate_excel(expenses_data)

    filename = f"gastos_{month or 'todos'}.xlsx"
    return StreamingResponse(
        iter([excel_bytes]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@app.post("/categorizar-ia/")
async def categorizar_ia(db: Session = Depends(get_db)):
    gastos = db.query(Expense).all()

    if not gastos:
        return {"message": "No hay gastos para categorizar"}

    expenses_data = [
        {"description": g.description, "amount": g.amount}
        for g in gastos
    ]

    categorized = categorize_with_ai(expenses_data)

    updated = 0
    for g, cat_data in zip(gastos, categorized):
        cat_name = cat_data["category"]
        cat = db.query(Category).filter(Category.name == cat_name).first()
        if cat and g.category_id != cat.id:
            g.category_id = cat.id
            updated += 1

    db.commit()

    return {
        "total": len(gastos),
        "actualizados": updated,
    }


@app.get("/reporte-mensual/")
def reporte_mensual(
    month: str = Query(..., description="Mes en formato YYYY-MM"),
    db: Session = Depends(get_db),
):
    return get_monthly_report(db, month)


@app.post("/sincronizar-sheets/")
async def sincronizar_sheets(
    spreadsheet_id: str = Query(..., description="ID de la hoja de Google Sheets"),
    month: str = Query(None, description="Mes en formato YYYY-MM"),
    db: Session = Depends(get_db),
):
    from services.sheets_service import sync_expenses_to_sheet

    query = db.query(Expense).join(Category, isouter=True)

    if month:
        query = query.filter(Expense.date.like(f"%{month}%"))

    gastos = query.order_by(Expense.date.desc()).all()

    expenses_data = [
        {
            "date": g.date,
            "description": g.description,
            "amount": g.amount,
            "category": g.category.name if g.category else "Sin categoria",
            "source": g.source,
        }
        for g in gastos
    ]

    result = sync_expenses_to_sheet(spreadsheet_id, expenses_data)
    return result
