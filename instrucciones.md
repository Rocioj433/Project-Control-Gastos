# Proyecto: Control de Gastos Personal

## Descripcion del Proyecto

Aplicacion movil diseñada para llevar un control detallado de los gastos diarios y mensuales.
El objetivo principal es facilitar la carga de gastos automatizando la lectura y categorizacion
a partir de resumenes de tarjetas de credito (en formato PDF o imagen).

Los gastos extraidos y categorizados se sincronizaran/exportaran a Google Sheets o archivos Excel.

---

## Funcionalidades Principales

1. **Carga de Resumenes**: Permitir al usuario subir un archivo (PDF o imagen) del resumen de su tarjeta.
2. **Procesamiento y Extraccion**: Leer el documento subido para identificar los gastos individuales (fecha, descripcion del comercio y monto).
3. **Autocategorizacion Inteligente**: Asignar automaticamente una categoria a cada gasto (ej. Supermercado, Transporte, Entretenimiento) basandose en la descripcion del comercio.
4. **Visualizacion**: Mostrar en la app movil un desglose visual de los gastos por categoria (dashboard), totales mensuales y reportes.
5. **Exportacion y Sincronizacion**: Generar un archivo Excel con los datos y/o sincronizar automaticamente los gastos procesados con una hoja de calculo en Google Sheets.

---

## Stack Tecnologico

### Frontend (Aplicacion Movil)
- **Tecnologia**: React Native + Expo (TypeScript)
- **Librerias clave**: expo-router (navegacion), react-native-chart-kit (graficos), axios (llamadas HTTP)
- **Justificacion**: Permite desarrollar aplicaciones nativas para iOS y Android manteniendo un unico codigo fuente.

### Backend (Servidor y Logica Core)
- **Tecnologia**: Python + FastAPI
- **Librerias clave**: pdfplumber (extraccion PDF), pandas (manipulacion de datos), openpyxl (Excel), SQLAlchemy (ORM)
- **Justificacion**: Python tiene el mejor ecosistema para procesamiento de documentos y ML. FastAPI es moderno, rapido y genera documentacion automatica.

### Base de Datos
- **Tecnologia**: PostgreSQL
- **ORM**: SQLAlchemy
- **Justificacion**: Estandar de la industria para datos relacionales. Robusto y ideal para datos financieros.

### Herramientas de IA/Procesamiento
- **Extraccion de Texto (PDF)**: pdfplumber
- **OCR (imagenes)**: pytesseract + Pillow (fase 2)
- **Categorizacion**: Reglas de texto + LLM (OpenAI API)
- **Generacion de Excel**: openpyxl
- **Google Sheets API**: google-api-python-client

---

## Estructura del Proyecto

```
Project-Control-Gastos/
│
├── instrucciones.md              # Este documento
├── ResumenTarjeta.pdf            # PDF de prueba
│
├── backend/
│   ├── main.py                   # Punto de entrada FastAPI
│   ├── requirements.txt          # Dependencias de Python
│   ├── database.py               # Configuracion de base de datos
│   ├── models.py                 # Modelos/entidades de la BD
│   ├── schemas.py                # Schemas de la API (request/response)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── pdf_service.py        # Extraccion de texto de PDFs
│   │   ├── categorizer.py        # Logica de autocategorizacion
│   │   └── excel_service.py      # Generacion de Excel
│   └── venv/                     # Entorno virtual Python
│
└── mobile/                       # (Fase 2) App React Native + Expo
    ├── app/
    ├── components/
    └── services/
```

---

## Flujo General del Sistema

```
[Usuario sube PDF] 
       │
       ▼
[Backend recibe archivo]
       │
       ▼
[pdfplumber extrae texto]
       │
       ▼
[Parser identifica gastos: fecha, comercio, monto]
       │
       ▼
[Categorizer asigna categoria al gasto]
       │
       ▼
[Se guardan gastos en PostgreSQL]
       │
       ▼
[Se genera Excel / Google Sheets]
       │
       ▼
[Frontend muestra dashboard con gastos]
```

---

## Categorias de Gasto (ejemplo inicial)

| Categoria      | Palabras clave de ejemplo                                    |
|----------------|--------------------------------------------------------------|
| Supermercado   | supermercado, mercado, carrefour, dia, coto, changomas       |
| Transporte     | uber, cabify, gasolina, estacionamiento, peaje, subte        |
| Entretenimiento| cine, netflix, spotify, steam, playstation, xbox             |
| Restaurantes   | restaurante, mcdonalds, burger king, delivery, rappi         |
| Salud          | farmacia, hospital, medico, clinica, obra social             |
| Servicios      | luz, gas, internet, telefono, agua, cable                    |
| Ropa           | zara, h&m, nike, adidas, shopping                            |
| Otros          | (categoria por defecto cuando no matchea nada)               |

---

## Pasos del Proyecto (orden de desarrollo)

### Fase 1: Backend Basico (COMPLETADA)
1. [x] Crear proyecto FastAPI con estructura basica
2. [x] Configurar entorno virtual e instalar dependencias
3. [x] Crear modelo de datos (Expense, Category)
4. [x] Crear endpoint para subir PDF y extraer gastos
5. [x] Implementar parser de PDF para identificar gastos
6. [x] Implementar sistema de autocategorizacion por reglas
7. [x] Crear endpoint para listar gastos
8. [x] Crear endpoint para exportar a Excel
9. [x] Probar todo con el PDF de prueba

### Fase 2: Frontend Movil (COMPLETADA)
10. [x] Inicializar proyecto Expo con TypeScript
11. [x] Crear pantalla de carga de PDF
12. [x] Crear pantalla de lista de gastos
13. [x] Crear dashboard con graficos
14. [x] Crear pantalla de resumen
15. [x] Integrar con el backend

### Fase 3: Funcionalidades Avanzadas
16. [ ] Integrar OCR para imagenes (pytesseract)
17. [ ] Integrar Google Sheets API
18. [ ] Categorizacion con LLM (OpenAI)
19. [ ] Autenticacion de usuarios
20. [ ] Filtros avanzados y reportes mensuales

---

## Metodologia de Trabajo

- **Desarrollo Incremental**: Cada paso se explica antes de escribir codigo.
- **Errores**: Si ocurre un error, se detiene el proceso para analizar:
  1. Ubicacion exacta (archivo y linea)
  2. Causa del problema
  3. Mecanismo detras del error
  4. Solucion aplicada
- **Testing**: Cada funcionalidad se prueba antes de avanzar al siguiente paso.
