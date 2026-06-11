export interface Gasto {
  fecha: string;
  descripcion: string;
  monto: number;
  montoUSD?: number;
  categoria: string;
  mes?: string;
  anio?: number;
}

export interface ParserConfig {
  headerKeywords: string[];
}

export const defaultConfig: ParserConfig = {
  headerKeywords: [
    'banco',
    'sucursal',
    'nro cuenta',
    'resumen',
    'fecha proceso',
    'direccion',
    'telefono',
    'page',
    'www',
    'www.',
    'pagina',
    'total',
    'subtotal',
    'iva',
    'tarjeta',
    'credito',
  ],
};

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04',
  may: '05', jun: '06', jul: '07', aug: '08',
  sep: '09', oct: '10', nov: '11', dec: '12',
};

function parseDate(dateStr: string): { fecha: string; mes: string; anio: number } | null {
  const match = dateStr.match(/(\d{2})-([a-z]{3})-(\d{2})/i);
  if (!match) return null;
  const day = match[1];
  const month = MONTHS[match[2].toLowerCase()];
  const yearSuffix = match[3];
  const anio = 2000 + parseInt(yearSuffix);
  return {
    fecha: `${day}/${month}`,
    mes: month,
    anio,
  };
}

function isNumericLine(line: string): boolean {
  return /^\d{4,6}$/.test(line.trim());
}

function parseMonto(line: string): number | null {
  const trimmed = line.trim().replace(/\./g, '');
  const match = trimmed.match(/^([\d,]+),(\d{2})$/);
  if (match) {
    const monto = parseFloat(match[1].replace(/,/g, '') + '.' + match[2]);
    return isNaN(monto) ? null : monto;
  }
  return null;
}

export function parseGastos(
  text: string,
  config: ParserConfig = defaultConfig
): Gasto[] {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l);
  const gastos: Gasto[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    const isHeader = config.headerKeywords.some((keyword) =>
      lowerLine.includes(keyword)
    );
    if (isHeader) {
      i++;
      continue;
    }

    const dateInfo = parseDate(line);
    if (!dateInfo) {
      i++;
      continue;
    }

    let descripcion = '';
    let monto: number | null = null;
    let montoUSD: number | undefined;
    let consumedLines = 1;

    if (i + 1 < lines.length) {
      const nextLine = lines[i + 1];

      const hasArs = nextLine.includes(',ARS,');
      const hasUsd = nextLine.includes(',USD,');

      if ((hasArs || hasUsd) && nextLine.includes('(')) {
        const descMatch = nextLine.match(/^([^(]+)/);
        descripcion = descMatch ? descMatch[1].trim() : nextLine;

        const montoMatch = nextLine.match(/,\s*([\d.]+),(\d{2})\)/);
        if (montoMatch) {
          const montoStr = montoMatch[1].replace(/\./g, '') + '.' + montoMatch[2];
          monto = parseFloat(montoStr);
        }

        if (hasUsd && monto !== null) {
          montoUSD = monto;
        }

        if (hasArs && monto !== null && i + 2 < lines.length) {
          const compLine = lines[i + 2];
          if (isNumericLine(compLine) && i + 3 < lines.length) {
            montoUSD = parseMonto(lines[i + 3]) ?? undefined;
            consumedLines = 4;
          } else {
            consumedLines = 2;
          }
        } else if (hasUsd) {
          consumedLines = 2;
        } else if (!hasArs && !hasUsd) {
          consumedLines = 2;
        }
      } else if (!nextLine.match(/\d{2}-[a-z]{3}-\d{2}/i) && !isNumericLine(nextLine)) {
        descripcion = nextLine;
        consumedLines = 2;

        if (i + 2 < lines.length) {
          const compLine = lines[i + 2];

          if (isNumericLine(compLine) && i + 3 < lines.length) {
            monto = parseMonto(lines[i + 3]);
            consumedLines = 4;

            if (i + 4 < lines.length) {
              const usdLine = lines[i + 4];
              const usdValue = parseMonto(usdLine);
              if (usdValue) {
                montoUSD = usdValue;
              }
            }
          }
        }
      }
    }

    if (dateInfo.fecha && descripcion && (monto !== null || montoUSD !== undefined) && (monto === null || monto > 0)) {
      gastos.push({
        fecha: dateInfo.fecha,
        descripcion,
        monto: monto ?? montoUSD ?? 0,
        montoUSD,
        categoria: 'General',
        mes: dateInfo.mes,
        anio: dateInfo.anio,
      });
    }

    i += Math.max(consumedLines, 1);
  }

  return gastos;
}

export function getTotal(gastos: Gasto[]): number {
  return gastos.reduce((sum, g) => sum + g.monto, 0);
}

export function getTotalUSD(gastos: Gasto[]): number {
  return gastos.reduce((sum, g) => sum + (g.montoUSD ?? 0), 0);
}

export function analyzeLines(text: string): {
  line: string;
  hasDate: boolean;
  hasDesc: boolean;
  hasComprobante: boolean;
  hasMonto: boolean;
}[] {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l);
  return lines.map((line) => ({
    line,
    hasDate: /\d{2}-[a-z]{3}-\d{2}/i.test(line),
    hasDesc: !/\d{2}-[a-z]{3}-\d{2}/i.test(line) && !/^\d{4,6}$/.test(line) && !/^[\d.]+,\d{2}$/.test(line),
    hasComprobante: /^\d{4,6}$/.test(line),
    hasMonto: /^[\d.]+,\d{2}$/.test(line),
  }));
}