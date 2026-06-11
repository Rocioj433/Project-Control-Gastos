import * as SQLite from 'expo-sqlite';
import { Gasto } from '../utils/pdfParser';

const DB_NAME = 'smartexpense.db';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

async function ensureDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  
  if (initPromise) {
    await initPromise;
    return db!;
  }
  
  initPromise = initDatabase();
  await initPromise;
  return db!;
}

export async function initDatabase(): Promise<void> {
  if (db) return;
  
  db = await SQLite.openDatabaseAsync(DB_NAME);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS gastos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      monto REAL NOT NULL,
      montoUSD REAL,
      categoria TEXT DEFAULT 'General',
      fuente TEXT DEFAULT 'pdf',
      mes TEXT,
      anio INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS resumen_mes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mes TEXT NOT NULL,
      anio INTEGER NOT NULL,
      totalPesos REAL DEFAULT 0,
      totalUSD REAL DEFAULT 0,
      cantidadGastos INTEGER DEFAULT 0,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(mes, anio)
    );
  `);
}

export async function insertGasto(gasto: Gasto, fuente: string = 'pdf'): Promise<number> {
  const database = await ensureDb();

  if (!gasto.fecha || !gasto.descripcion || !gasto.monto) {
    throw new Error('Gasto inválido: faltan campos requeridos');
  }

  const mes = gasto.mes ?? `${new Date().getMonth() + 1}`.padStart(2, '0');
  const anio = gasto.anio ?? new Date().getFullYear();

  const result = await database.runAsync(
    `INSERT INTO gastos (fecha, descripcion, monto, montoUSD, categoria, fuente, mes, anio)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    gasto.fecha,
    gasto.descripcion,
    gasto.monto,
    gasto.montoUSD ?? null,
    gasto.categoria,
    fuente,
    mes,
    anio
  );

  return result.lastInsertRowId;
}

export async function insertGastosBatch(gastos: Gasto[], fuente: string = 'pdf'): Promise<number> {
  const database = await ensureDb();

  let count = 0;
  for (const gasto of gastos) {
    try {
      const existe = await database.getFirstAsync<{ id: number }>(
        `SELECT id FROM gastos WHERE fecha = ? AND descripcion = ? AND monto = ?`,
        [gasto.fecha, gasto.descripcion, gasto.monto]
      );

      if (!existe) {
        await insertGasto(gasto, fuente);
        count++;
      }
    } catch (err) {
      console.warn('Error al insertar gasto:', err);
    }
  }

  return count;
}

export async function getGastos(mes?: string, anio?: number): Promise<Gasto[]> {
  const database = await ensureDb();

  let query = 'SELECT * FROM gastos WHERE mes IS NOT NULL';
  const params: (string | number)[] = [];

  if (mes && anio) {
    query += ' AND mes = ? AND anio = ?';
    params.push(mes, anio);
  }

  query += ' ORDER BY fecha DESC';

  const rows = await database.getAllAsync<{
    id: number;
    fecha: string;
    descripcion: string;
    monto: number;
    montoUSD: number | null;
    categoria: string;
    fuente: string;
    mes: string;
    anio: number;
  }>(query, params);

  return rows.map((row) => ({
    fecha: row.fecha,
    descripcion: row.descripcion,
    monto: row.monto,
    montoUSD: row.montoUSD ?? undefined,
    categoria: row.categoria,
    mes: row.mes,
    anio: row.anio,
  }));
}

export async function getResumenMes(mes: string, anio: number): Promise<{
  totalPesos: number;
  totalUSD: number;
  cantidadGastos: number;
}> {
  const database = await ensureDb();

  const row = await database.getFirstAsync<{
    totalPesos: number;
    totalUSD: number;
    cantidadGastos: number;
  }>(
    `SELECT 
      COALESCE(SUM(monto), 0) as totalPesos,
      COALESCE(SUM(montoUSD), 0) as totalUSD,
      COUNT(*) as cantidadGastos
     FROM gastos WHERE mes = ? AND anio = ?`,
    [mes, anio]
  );

  if (row) {
    return row;
  }

  return { totalPesos: 0, totalUSD: 0, cantidadGastos: 0 };
}

async function actualizarResumenMes(): Promise<void> {
  const database = await ensureDb();

  const meses = await database.getAllAsync<{ mes: string; anio: number }>(
    'SELECT DISTINCT mes, anio FROM gastos WHERE mes IS NOT NULL'
  );

  for (const { mes, anio } of meses) {
    if (!mes || !anio) continue;

    const totales = await database.getFirstAsync<{ totalPesos: number; totalUSD: number; count: number }>(
      `SELECT 
        COALESCE(SUM(monto), 0) as totalPesos,
        COALESCE(SUM(montoUSD), 0) as totalUSD,
        COUNT(*) as count
       FROM gastos WHERE mes = ? AND anio = ?`,
      [mes, anio]
    );

    if (totales) {
      await database.runAsync(
        `INSERT INTO resumen_mes (mes, anio, totalPesos, totalUSD, cantidadGastos)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(mes, anio) DO UPDATE SET
         totalPesos = excluded.totalPesos,
         totalUSD = excluded.totalUSD,
         cantidadGastos = excluded.cantidadGastos,
         updatedAt = CURRENT_TIMESTAMP`,
        mes,
        anio,
        totales.totalPesos,
        totales.totalUSD,
        totales.count
      );
    }
  }
}

export async function clearGastos(): Promise<void> {
  const database = await ensureDb();
  await database.execAsync('DELETE FROM gastos');
  await database.execAsync('DELETE FROM resumen_mes');
}

export async function corregirFechas(): Promise<number> {
  const database = await ensureDb();

  const gastos = await database.getAllAsync<{
    id: number;
    fecha: string;
  }>('SELECT id, fecha FROM gastos');

  let count = 0;
  for (const gasto of gastos) {
    const parts = gasto.fecha.split('/');
    if (parts.length >= 2) {
      let month = parts[1];
      if (month && month.length <= 2) {
        month = month.padStart(2, '0');
        await database.runAsync(
          'UPDATE gastos SET mes = ?, anio = 2026 WHERE id = ?',
          [month, gasto.id]
        );
        count++;
      }
    }
  }

  await database.execAsync('DELETE FROM resumen_mes');
  await actualizarResumenMes();

  return count;
}