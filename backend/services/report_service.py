from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from models import Expense, Category


def get_monthly_report(db: Session, month: str) -> dict:
    month_num = int(month.split("-")[1])
    year_num = int(month.split("-")[0])

    gastos_mes = (
        db.query(Expense)
        .filter(Expense.date.like(f"%{month}%"))
        .all()
    )

    total = sum(g.amount for g in gastos_mes)

    por_categoria = (
        db.query(
            Category.name.label("categoria"),
            Category.color.label("color"),
            Category.icon.label("icon"),
            func.sum(Expense.amount).label("total"),
            func.count(Expense.id).label("cantidad"),
        )
        .join(Category, Expense.category_id == Category.id, isouter=True)
        .filter(Expense.date.like(f"%{month}%"))
        .group_by(Category.name, Category.color, Category.icon)
        .all()
    )

    top_gastos = (
        db.query(Expense)
        .filter(Expense.date.like(f"%{month}%"))
        .order_by(Expense.amount.desc())
        .limit(5)
        .all()
    )

    dias_con_gastos = len(set(g.date for g in gastos_mes))
    promedio_diario = total / dias_con_gastos if dias_con_gastos > 0 else 0

    month_anterior = f"{year_num}-{month_num - 1:02d}" if month_num > 1 else f"{year_num - 1}-12"
    total_anterior = (
        db.query(func.sum(Expense.amount))
        .filter(Expense.date.like(f"%{month_anterior}%"))
        .scalar()
        or 0
    )

    variacion = ((total - total_anterior) / total_anterior * 100) if total_anterior > 0 else 0

    return {
        "month": month,
        "total": total,
        "total_anterior": total_anterior,
        "variacion": round(variacion, 1),
        "cantidad_gastos": len(gastos_mes),
        "dias_con_gastos": dias_con_gastos,
        "promedio_diario": round(promedio_diario, 2),
        "por_categoria": [
            {
                "categoria": r.categoria or "Sin categoria",
                "color": r.color,
                "icon": r.icon,
                "total": r.total or 0,
                "cantidad": r.cantidad,
                "porcentaje": round((r.total or 0) / total * 100, 1) if total > 0 else 0,
            }
            for r in por_categoria
        ],
        "top_gastos": [
            {
                "date": g.date,
                "description": g.description,
                "amount": g.amount,
                "category": g.category.name if g.category else "Sin categoria",
            }
            for g in top_gastos
        ],
    }
