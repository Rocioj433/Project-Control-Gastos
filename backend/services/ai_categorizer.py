import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

CATEGORIES = [
    "Supermercado",
    "Transporte",
    "Entretenimiento",
    "Restaurantes",
    "Salud",
    "Servicios",
    "Ropa",
    "Otros",
]


def categorize_with_ai(expenses: list[dict]) -> list[dict]:
    if not expenses:
        return []

    expenses_text = "\n".join(
        [f"- {e['description']} (${e['amount']:,.2f})" for e in expenses]
    )

    prompt = f"""Categoriza cada gasto en una de estas categorias: {', '.join(CATEGORIES)}

Gastos:
{expenses_text}

Responde UNICAMENTE con un JSON array donde cada elemento tiene:
- "description": la descripcion original
- "category": la categoria asignada

Ejemplo:
[{{"description": "MERPAGO*COTO", "category": "Supermercado"}}]"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )

        content = response.choices[0].message.content.strip()

        import json
        if content.startswith("```"):
            content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        result = json.loads(content)

        categorized = {}
        for item in result:
            categorized[item["description"]] = item["category"]

        return [
            {
                **e,
                "category": categorized.get(e["description"], "Otros"),
            }
            for e in expenses
        ]

    except Exception as e:
        print(f"Error con OpenAI: {e}")
        return [{**e, "category": "Otros"} for e in expenses]
