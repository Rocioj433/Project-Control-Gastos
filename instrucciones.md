# PROYECTO: SmartExpense v2 - Extractor de Gastos (React Native + API Node.js)

**Stack Tecnológico:** - **App Móvil:** React Native (Expo) + TypeScript + SQLite
- **Backend (API):** Node.js + Express + Multer (Carga de archivos) + pdf-parse (Extracción)

---

## 📂 FASE 1: Entorno y Estructura de Navegación (Mobile)
**Objetivo:** Configurar el "esqueleto" funcional de la app móvil.
- Inicializar proyecto con `npx create-expo-app` usando la plantilla de **TypeScript**.
- Instalar e implementar `react-navigation` (Native Stack).
- Crear las pantallas: `HomeScreen` (Dashboard vacío) y `ScannerScreen` (Carga de PDF).
- **Conceptos:** Estructura de carpetas (`src/`), Stack Navigator y Tipado básico.

## 📂 FASE 2: Gestión de Archivos y Selector (Mobile)
**Objetivo:** Permitir que la app acceda y seleccione los archivos del celular.
- Instalar e implementar `expo-document-picker`.
- Crear un botón que abra el selector filtrando solo por `.pdf`.
- Guardar el URI del archivo seleccionado en un estado local (`useState`).
- **Conceptos:** Hook `useState`, manejo de promesas y permisos del sistema de archivos.

## 🧠 FASE 3: Servidor de Extracción - API REST (Backend)
**Objetivo:** Crear el entorno intermedio que procesará el PDF real.
- Configurar un proyecto básico de Node.js con `express`.
- Implementar `multer` para recibir el archivo PDF que enviará la app móvil.
- Usar `pdf-parse` para extraer el texto plano (`Raw Text`) del archivo recibido.
- **Conceptos:** Protocolo HTTP, endpoints (POST), Middlewares y flujo de archivos en el backend.

## 🔍 FASE 4: Lógica de Procesamiento y RegEx (Backend)
**Objetivo:** Filtrar el texto del banco y devolver datos estructurados (JSON).
- Crear expresiones regulares (`RegEx`) para extraer: **Fecha**, **Descripción** y **Monto**.
- Limpiar el texto (ignorar cabeceras y totales generales).
- Devolver una respuesta JSON limpia a la aplicación móvil con un array de gastos.
- **Conceptos:** Expresiones Regulares aplicadas a strings complejos, limpieza y mapeo de datos.

## 💾 FASE 5: Integración y Persistencia con SQLite (Mobile)
**Objetivo:** Conectar la app al backend y guardar los gastos localmente.
- Configurar `fetch` en la app móvil (Fase 2) para enviar el PDF a la API de Node.js.
- Recibir el JSON con los gastos procesados.
- Configurar `expo-sqlite` y definir la tabla `gastos` (id, fecha, detalle, monto, categoria).
- Hacer el `INSERT` masivo de los datos devueltos por el backend.
- **Conceptos:** Conexión de red local, base de datos relacional móvil y ciclo de vida (`useEffect`).

## 📊 FASE 6: UI Avanzada y Listado (Mobile)
**Objetivo:** Mostrar los resultados de forma limpia y profesional.
- Implementar `FlatList` para renderizar los gastos desde SQLite.
- Crear un componente de "Card" estilizado con un diseño limpio.
- Añadir un contador acumulador que sume el total de gastos detectados.
- **Conceptos:** Optimización de renderizado de listas y diseño con Flexbox.

---

## 🛑 REGLAS DE ORO
1. **Fase por Fase:** No avanzamos de fase hasta que la anterior esté testeada, funcionando y comprendida.
2. **Explicación de Hooks y Conceptos:** Al final de cada bloque de código clave, desglosaremos su funcionamiento.
3. **Modularidad:** Separar lógica de utilidades de los componentes visuales.