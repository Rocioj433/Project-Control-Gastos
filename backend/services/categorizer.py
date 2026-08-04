CATEGORIAS_KEYWORDS = {
    "Supermercado": [
        "coto", "carrefour", "dia", "changomas", "jumbo", "disco",
        "vea", "arketivo", "mercadolibre", "merpago*coto", "almacen",
    ],
    "Transporte": [
        "uber", "cabify", "gasolina", "estacionamiento", "peaje",
        "subte", "bondi", "naftera", "YPF", "shell", "personal",
    ],
    "Entretenimiento": [
        "netflix", "spotify", "steam", "playstation", "xbox",
        "faceit", "youtube", "hbo", "disney", "prime video",
        "microsoft*store", "google*youtube", "google*google",
    ],
    "Restaurantes": [
        "mcdonalds", "burger king", "starbucks", "rappi", "pedidosya",
        "ifood", "delivery", "restaurante", "bar", "cafe", "pizza",
    ],
    "Salud": [
        "farmacia", "hospital", "medico", "clinica", "obra social",
        "farma", "droga", "salud", "farmer", "farmaplus",
    ],
    "Servicios": [
        "luz", "gas", "internet", "telefono", "agua", "cable",
        "telecom", "movistar", "claro", "personal",
    ],
    "Ropa": [
        "zara", "h&m", "nike", "adidas", "shopping", "forever",
        "pull&bear", "bershka", "stradivarius",
    ],
}


def categorize(description: str) -> str:
    desc_lower = description.lower()

    for category, keywords in CATEGORIAS_KEYWORDS.items():
        for keyword in keywords:
            if keyword.lower() in desc_lower:
                return category

    return "Otros"
