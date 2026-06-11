import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Gasto } from '../utils/pdfParser';
import * as db from '../services/database';

interface GastosContextType {
  gastos: Gasto[];
  loading: boolean;
  resumen: { totalPesos: number; totalUSD: number; cantidadGastos: number };
  insertarGastos: (gastos: Gasto[]) => Promise<void>;
  recargarGastos: () => Promise<void>;
}

const GastosContext = createContext<GastosContextType | undefined>(undefined);

export function GastosProvider({ children }: { children: ReactNode }) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState({ totalPesos: 0, totalUSD: 0, cantidadGastos: 0 });

  const recargarGastos = async () => {
    setLoading(true);
    try {
      await db.initDatabase();
      const allGastos = await db.getGastos();
      setGastos(allGastos);

      const totalPesos = allGastos.reduce((sum, g) => sum + g.monto, 0);
      const totalUSD = allGastos.reduce((sum, g) => sum + (g.montoUSD ?? 0), 0);

      setResumen({
        totalPesos,
        totalUSD,
        cantidadGastos: allGastos.length,
      });
    } catch (error) {
      console.error('Error al cargar gastos:', error);
    } finally {
      setLoading(false);
    }
  };

  const insertarGastos = async (nuevosGastos: Gasto[]) => {
    try {
      await db.insertGastosBatch(nuevosGastos);
      await recargarGastos();
    } catch (error) {
      console.error('Error al insertar gastos:', error);
      throw error;
    }
  };

  useEffect(() => {
    recargarGastos();
  }, []);

  return (
    <GastosContext.Provider
      value={{ gastos, loading, resumen, insertarGastos, recargarGastos }}
    >
      {children}
    </GastosContext.Provider>
  );
}

export function useGastos() {
  const context = useContext(GastosContext);
  if (context === undefined) {
    throw new Error('useGastos debe usarse dentro de GastosProvider');
  }
  return context;
}