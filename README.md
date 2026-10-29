# Control de Gastos

Aplicación para llevar el control de gastos personales a partir de los **resúmenes de tarjeta de crédito en PDF**: extrae los movimientos, los categoriza automáticamente y los deja disponibles en una app móvil, en Excel o en Google Sheets.

El problema que resuelve: cargar gastos a mano es tedioso y nadie lo sostiene en el tiempo. Acá subís el PDF del resumen y el sistema hace el trabajo repetitivo.

```
PDF del resumen  →  extracción  →  parseo  →  categorización  →  app / Excel / Sheets
```

---

## Stack

| Capa | Tecnología |
| --- | --- |
| App móvil | React Native 0.86 + Expo SDK 57, expo-router, react-native-chart-kit, axios, TypeScript |
| API | Python 3.11 + FastAPI, Uvicorn, Pydantic |
| Persistencia | SQLite + SQLAlchemy 2 (ORM) |
| Extracción de PDF | pdfplumber |
| Categorización | Reglas por palabras clave + LLM opcional (OpenAI) |
| Exportación | openpyxl (Excel) · Google Sheets API (service account) |

---

## Funcionalidades

- **Importación de resúmenes**: subís el PDF y la API devuelve cuántos gastos son nuevos y cuáles ya estaban cargados (deduplicación por fecha + descripción + monto + archivo de origen).
- **Parseo de movimientos**: detecta fecha (`DD-Mmm-YY`), descripción y monto en formato local (`1.234,56`), descartando las líneas de pago del resumen.
- **Categorización en dos pasos**: primero reglas determinísticas por comercio (Coto, Uber, Netflix, farmacias…); después, opcionalmente, un LLM que reclasifica todo con un solo request.
- **Dashboard**: total general y desglose por categoría con porcentajes y gráfico.
- **Filtros**: por mes (`YYYY-MM`) y por categoría.
- **Exportación**: Excel con formato (encabezados, bordes, anchos) o sincronización a una hoja de Google Sheets.
- **Reporte mensual**: total del mes, comparación contra el mes anterior (variación %), promedio diario, desglose por categoría y top 5 de gastos.
- **49 tests** sobre el parser, la categorización, la exportación, los modelos y los endpoints.

---

## Estructura

```
Project-Control-Gastos/
├── backend/
│   ├── main.py                 # App FastAPI y todos los endpoints
│   ├── database.py             # Engine de SQLite + session factory
│   ├── models.py               # Category y Expense (SQLAlchemy)
│   ├── requirements.txt
│   ├── tests/                  # 49 tests (pytest + TestClient sobre SQLite en memoria)
│   └── services/
│       ├── __init__.py         # extract_text_from_pdf + parse_expenses
│       ├── categorizer.py      # Reglas por palabras clave
│       ├── ai_categorizer.py   # Categorización con OpenAI
│       ├── excel_service.py    # Generación de .xlsx
│       ├── report_service.py   # Reporte mensual
│       └── sheets_service.py   # Sincronización con Google Sheets
├── mobile/
│   ├── app/                    # Rutas de expo-router
│   │   ├── _layout.tsx         # Tabs: Inicio · Subir · Gastos · Resumen
│   │   ├── index.tsx           # Dashboard
│   │   ├── upload.tsx          # Selección y subida del PDF
│   │   ├── gastos.tsx          # Listado de movimientos
│   │   └── resumen.tsx         # Reporte mensual
│   └── services/
│       ├── api.ts              # Cliente axios
│       └── theme.ts            # Colores
└── instrucciones.md            # Documento de diseño original
```

---

## Puesta en marcha

### 1. Backend

```bash
cd backend

python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Creá `backend/.env` a partir del ejemplo:

```bash
cp .env.example .env
```

```ini
# backend/.env
OPENAI_API_KEY=sk-...
```

La clave solo es necesaria para `POST /categorizar-ia/`. Todo lo demás funciona sin ella.

Para sincronizar con Google Sheets hace falta además un **service account** de Google Cloud con la Sheets API habilitada:

1. Crear el service account y descargar la clave JSON.
2. Guardarla como `backend/service_account.json`.
3. Compartir la hoja destino con el email del service account (permiso de edición).

Ambos archivos están en `.gitignore`. **No los commitees.**

Levantar el servidor:

```bash
uvicorn main:app --reload
```

- API: <http://localhost:8000>
- Documentación interactiva: <http://localhost:8000/docs>

Las tablas y las categorías por defecto se crean solas en el primer arranque.

### 2. App móvil

```bash
cd mobile
npm install
npx expo start
```

Antes de correr, ajustá la URL de la API en `mobile/services/api.ts`. Por defecto apunta a `http://192.168.0.103:8000` para poder probar desde el teléfono en la misma red; cambiala por la IP de tu máquina:

```ts
const API_URL = Platform.select({
  web: "http://localhost:8000",
  default: "http://<TU_IP_LOCAL>:8000",
});
```

---

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/` | Health check |
| `POST` | `/procesar-resumen/` | Sube un PDF (`multipart/form-data`, campo `file`), parsea y guarda los gastos nuevos |
| `GET` | `/gastos/` | Lista gastos. Query: `month` (`YYYY-MM`), `category` |
| `GET` | `/resumen/` | Totales por categoría con porcentajes |
| `GET` | `/exportar-excel/` | Descarga un `.xlsx`. Query: `month` (opcional) |
| `POST` | `/categorizar-ia/` | Reclasifica todos los gastos con OpenAI |
| `GET` | `/reporte-mensual/` | Reporte del mes. Query: `month` (`YYYY-MM`, requerido) |
| `POST` | `/sincronizar-sheets/` | Vuelca los gastos a una hoja. Query: `spreadsheet_id`, `month` (opcional) |

Ejemplo:

```bash
curl -X POST http://localhost:8000/procesar-resumen/ -F "file=@ResumenTarjeta.pdf"

curl "http://localhost:8000/gastos/?month=2026-03&category=Supermercado"

curl -OJ "http://localhost:8000/exportar-excel/?month=2026-03"
```

---

## Tests

La suite corre sobre una **base SQLite en memoria** (el fixture `conftest.py` parchea el engine antes de importar `main`, así que no toca tu base real).

```bash
cd backend
venv\Scripts\activate        # o: source venv/bin/activate
pip install pytest
pytest
```

| Archivo | Cubre |
| --- | --- |
| `test_pdf_service.py` | Extracción de texto y parseo de líneas del resumen |
| `test_categorizer.py` | Reglas por palabras clave y casos sin match |
| `test_excel_service.py` | Estructura y formato del `.xlsx` generado |
| `test_models.py` | Relaciones y constraints de `Category` / `Expense` |
| `test_main.py` | Endpoints completos con `TestClient` |

---

## Modelo de datos

```
Category                    Expense
────────                    ───────
id            ←──────────   category_id (FK, nullable)
name (unique)               id
color                       date        (YYYY-MM-DD, string)
icon                        description
                            amount      (float)
                            source      (nombre del PDF)
                            created_at
```

`date` se guarda como texto `YYYY-MM-DD` para poder filtrar por mes con `LIKE`, lo que mantiene las consultas simples y portables.

---

## Decisiones de diseño

**SQLite en lugar de PostgreSQL.** El proyecto es de uso personal y de un solo usuario: SQLite evita levantar un servicio y el archivo de base viaja con el repo local. La capa de acceso es SQLAlchemy, así que migrar a PostgreSQL es cambiar una línea en `database.py`.

**Deduplicación en la importación.** Volver a subir el mismo resumen no duplica gastos: se compara contra fecha, descripción, monto y nombre del archivo. La respuesta informa cuántos quedaron afuera.

**Reglas antes que LLM.** La categorización por palabras clave es gratis, instantánea y predecible; se usa en la importación. El LLM queda como acción explícita del usuario, porque implica costo por request y no siempre mejora el resultado.

**Credenciales de Google.** La autenticación con Google se resuelve con un service account (credenciales JWT firmadas por la librería de Google). No hay login de usuarios en la aplicación.

---

## Limitaciones conocidas

- El parser está ajustado a un formato de resumen específico (fechas `DD-Mmm-YY`, importes `1.234,56`). Para otros bancos hay que extender `parse_expenses` en `backend/services/__init__.py`.
- Solo procesa PDFs con texto seleccionable. Los resúmenes escaneados como imagen necesitarían OCR, que está planteado pero no implementado.
- No hay autenticación en la API: está pensada para correr en localhost o en una red privada.
- La app móvil apunta a una IP fija en `mobile/services/api.ts`. El `mobile/.env` con `EXPO_PUBLIC_API_URL` todavía no se consume desde el código.

## Roadmap

- [ ] OCR para resúmenes en imagen (pytesseract + Pillow)
- [ ] Parser configurable por banco
- [ ] Leer `EXPO_PUBLIC_API_URL` en `mobile/services/api.ts`
- [ ] Presupuestos por categoría y alertas

---

## Licencia

MIT.
