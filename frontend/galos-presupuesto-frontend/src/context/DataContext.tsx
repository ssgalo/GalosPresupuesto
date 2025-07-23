import React, { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import type { Gasto, Ingreso } from '../features/egresos/types'; // Asegúrate de definir el tipo Ingreso

const API_URL = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3001/api';

interface DataContextType {
  gastos: Gasto[];
  ingresos: Ingreso[];
  cargarDatos: () => Promise<void>;
  agregarGasto: (gasto: Omit<Gasto, 'id'>) => Promise<void>;
  borrarGasto: (id: Gasto['id']) => Promise<void>;
  agregarIngreso: (ingreso: Omit<Ingreso, 'id'>) => Promise<void>;
  borrarIngreso: (id: Ingreso['id']) => Promise<void>;
  editarGasto: (id: Gasto['id'], gasto: Omit<Gasto, 'id' | 'fecha_creacion' | 'mes' | 'year'>) => Promise<void>;
}

// Renombramos el contexto para que sea más genérico
const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);

  const cargarDatos = async () => {
    try {
      const [gastosRes, ingresosRes] = await Promise.all([
        fetch(`${API_URL}/gastos`),
        fetch(`${API_URL}/ingresos`)
      ]);
      if (!gastosRes.ok || !ingresosRes.ok) {
        throw new Error('Error al cargar los datos');
      }
      const gastosData = await gastosRes.json();
      const ingresosData = await ingresosRes.json();
      setGastos(gastosData);
      setIngresos(ingresosData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const agregarGasto = async (nuevoGasto: Omit<Gasto, 'id'>) => {
    // (Lógica existente para agregar gasto)
    await fetch(`${API_URL}/gastos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoGasto),
    });
    await cargarDatos(); // Recargar todo para mantener consistencia
  };

  const borrarGasto = async (id: Gasto['id']) => {
    // (Lógica existente para borrar gasto)
    await fetch(`${API_URL}/gastos/${id}`, { method: 'DELETE' });
    setGastos(prev => prev.filter(g => g.id !== id));
  };

  const agregarIngreso = async (nuevoIngreso: Omit<Ingreso, 'id'>) => {
    await fetch(`${API_URL}/ingresos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoIngreso),
    });
    await cargarDatos(); // Recargar todo para mantener consistencia
  };

  const borrarIngreso = async (id: Ingreso['id']) => {
    await fetch(`${API_URL}/ingresos/${id}`, { method: 'DELETE' });
    setIngresos(prev => prev.filter(i => i.id !== id));
  };

  const editarGasto = async (id: Gasto['id'], gastoActualizado: Omit<Gasto, 'id' | 'fecha_creacion' | 'mes' | 'year'>) => {
    try {
        await fetch(`${API_URL}/gastos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gastoActualizado)
        });
        await cargarDatos(); // Recargar para reflejar los cambios
    } catch (error) {
        console.error("Error al editar el gasto:", error);
    }
  };

  return (
    <DataContext.Provider value={{ gastos, ingresos, cargarDatos, agregarGasto, borrarGasto, agregarIngreso, borrarIngreso, editarGasto }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  return context;
};