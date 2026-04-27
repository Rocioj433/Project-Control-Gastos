# PROYECTO: SmartExpense - Extractor de Gastos desde PDF

**Stack Tecnológico:** React Native (Expo) + TypeScript + SQLite

## Contexto para el Desarrollador IA

Soy un estudiante de Análisis de Sistemas y quiero construir esta app para aprender React Native.
**Regla Estricta:** Debes trabajar **fase por fase**. No avances a la siguiente hasta que yo confirme que la anterior funciona y que he comprendido los conceptos. Al final de cada fase, explícame los Hooks y componentes utilizados.

---

## FASE 1: Entorno y Estructura de Navegación

**Objetivo:** Configurar el "esqueleto" funcional de la aplicación.

- Inicializar proyecto con `npx create-expo-app` usando la plantilla de **TypeScript**.
- Instalar e implementar `react-navigation` (Native Stack).
- Crear las pantallas:
  1. `HomeScreen`: Dashboard principal (actualmente vacío).
  2. `ScannerScreen`: Interfaz para cargar el PDF.
- **Conceptos a enseñar:** Estructura de carpetas (`src/`), Stack Navigator y Tipado básico.

---

## FASE 2: Gestión de Archivos (File Picker)

**Objetivo:** Permitir que la app acceda a los archivos del celular.

- Instalar e implementar `expo-document-picker`.
- Crear un botón que abra el selector de archivos, filtrando solo por archivos `.pdf`.
- Guardar el URI del archivo seleccionado en un estado local.
- **Conceptos a enseñar:** Hooks (`useState`), Manejo de promesas y permisos de sistema.

---

## FASE 3: Extracción y Parsing (Lógica Central)

**Objetivo:** Convertir el dibujo del PDF en datos útiles.

- Implementar una estrategia para extraer el texto (Raw Text).
- **Lógica de Procesamiento (RegEx):**
  - Crear patrones para identificar: **Fecha** (ej: DD/MM), **Descripción** (Comercio) y **Monto**.
  - Función de limpieza para ignorar cabeceras del banco.
- **Conceptos a enseñar:** Expresiones Regulares aplicadas a strings, Transformación de datos (Map y Filter).

---

## FASE 4: Persistencia con SQLite

**Objetivo:** Guardar los gastos para que persistan al cerrar la app.

- Configurar `expo-sqlite`.
- Definir el esquema de la tabla `gastos` (id, fecha, detalle, monto, categoria).
- Crear una capa de servicio para hacer el `INSERT` de los datos procesados en la Fase 3.
- **Conceptos a enseñar:** Base de datos relacional en móviles, Ciclo de vida del componente (`useEffect`).

---

## FASE 5: UI Avanzada y Listado

**Objetivo:** Mostrar los resultados de forma profesional.

- Implementar `FlatList` para renderizar los gastos desde la base de datos.
- Crear un componente de "Card" para cada gasto con un diseño limpio.
- Añadir un contador que sume el total de gastos detectados.
- **Conceptos a enseñar:** Optimización de renderizado y diseño con Flexbox.

---

## REGLAS DE ORO

1. **Modularidad:** Separa la lógica (utils) de la vista (components).
2. **Explicación:** Después de cada bloque de código, dime qué hace cada función clave.
3. **Paso a Paso:** Si pregunto algo sobre la Fase 1, no me respondas con código de la Fase 4.
