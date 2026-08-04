# Proyecto: Control de Gastos Personal

## Descripción del Proyecto
Aplicación móvil diseñada para llevar un control detallado de los gastos diarios y mensuales. El objetivo principal de la aplicación es facilitar la carga de gastos automatizando la lectura y categorización a partir de resúmenes de tarjetas de crédito (en formato PDF o imagen). Además, los gastos extraídos y categorizados se sincronizarán/exportarán a Google Sheets o archivos Excel.

## Funcionalidades Principales
1. **Carga de Resúmenes**: Permitir al usuario subir un archivo (PDF o imagen) del resumen de su tarjeta.
2. **Procesamiento y Extracción**: Leer el documento subido para identificar los gastos individuales (fecha, descripción del comercio y monto).
3. **Autocategorización Inteligente**: Asignar automáticamente una categoría a cada gasto (ej. Supermercado, Transporte, Entretenimiento) basándose en la descripción del comercio, emulando la funcionalidad de aplicaciones como Mercado Pago.
4. **Visualización**: Mostrar en la app móvil un desglose visual de los gastos por categoría (dashboard), totales mensuales y reportes.
5. **Exportación y Sincronización**: Generar un archivo Excel con los datos y/o sincronizar automáticamente los gastos procesados con una hoja de cálculo en Google Sheets.

## Stack Tecnológico Elegido

### 📱 Frontend (Aplicación Móvil)
- **Tecnología**: React Native usando Expo (JavaScript/TypeScript).
- **Justificación**: Permite desarrollar aplicaciones nativas para iOS y Android manteniendo un único código fuente. Es altamente demandado en la industria y Expo simplifica enormemente el proceso de desarrollo y pruebas en dispositivos físicos.

### ⚙️ Backend (Servidor y Lógica Core)
- **Tecnología**: Python con el framework FastAPI.
- **Justificación**: Python cuenta con el mejor ecosistema para procesamiento de documentos (PDFs/OCR) y algoritmos de categorización. FastAPI es veloz, moderno y crea automáticamente la documentación de la API.

### 🗄️ Base de Datos
- **Tecnología**: PostgreSQL.
- **ORM**: SQLAlchemy (librería para interactuar con la base de datos desde Python sin escribir SQL directo).
- **Justificación**: Estándar de la industria para datos relacionales. Es robusta y perfecta para datos financieros (donde las relaciones entre usuarios, gastos y categorías son claras).

### 🛠️ Herramientas y Librerías Clave
- **Extracción de Texto (PDF)**: `pdfplumber` o `PyPDF2`.
- **Manipulación de Excel**: `pandas` u `openpyxl`.
- **Integración con Google**: API oficial de Google Sheets.
- **Categorización**: Reglas de texto en Python o integración con IA (ej. OpenAI API).

## Metodología de Trabajo y Reglas de Colaboración
- **Desarrollo Paso a Paso**: Construiremos el proyecto de forma incremental. Cada paso será explicado claramente (el por qué y para qué) antes de escribir el código.
- **Gestión y Explicación de Errores**: Si ocurre un error durante el desarrollo, nos detendremos para analizarlo. Recibirás una explicación detallada sobre:
  1. Dónde está ubicado exactamente el error (archivo y línea).
  2. Qué está causando el problema.
  3. Cómo funciona el mecanismo detrás del error para entenderlo a fondo.
  4. La solución aplicada.
