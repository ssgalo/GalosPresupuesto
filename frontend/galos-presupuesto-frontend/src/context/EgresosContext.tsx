import React, { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
// Asume que la ruta al tipo y al mock son correctas
import type { Gasto } from '../features/egresos/types'; 
import mockGastosData from '../mock/egresos.json';

interface EgresosContextType {
  gastos: Gasto[];
  agregarGasto: (gasto: Omit<Gasto, 'id'>) => void;
  agregarGastos: (nuevosGastos: Omit<Gasto, 'id'>[]) => void; // <--- NUEVA FUNCIÓN
}

const EgresosContext = createContext<EgresosContextType | undefined>(undefined);

export const EgresosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gastos, setGastos] = useState<Gasto[]>([]);

  useEffect(() => {
    // Se asegura de que los datos del mock tengan un tipo Gasto[]
    setGastos(mockGastosData as Gasto[]);
  }, []);

  const agregarGasto = (nuevoGasto: Omit<Gasto, 'id'>) => {
    const gastoConId: Gasto = {
      ...nuevoGasto,
      id: 0, // Usar crypto para IDs más robustos
    };
    setGastos(prevGastos => [gastoConId, ...prevGastos]);
  };

  // --- INICIO: NUEVA FUNCIÓN PARA AGREGAR MÚLTIPLES GASTOS ---
  const agregarGastos = (nuevosGastos: Omit<Gasto, 'id'>[]) => {
    const gastosConId = nuevosGastos.map(gasto => ({
        ...gasto,
        id: 0, // Asigna un ID único a cada nuevo gasto
    }));
    setGastos(prevGastos => [...prevGastos, ...gastosConId]);
  };
  // --- FIN: NUEVA FUNCIÓN ---

  return (
    <EgresosContext.Provider value={{ gastos, agregarGasto, agregarGastos }}>
      {children}
    </EgresosContext.Provider>
  );
};

export const useEgresos = () => {
  const context = useContext(EgresosContext);
  if (context === undefined) {
    throw new Error('useEgresos debe ser usado dentro de un EgresosProvider');
  }
  return context;
};