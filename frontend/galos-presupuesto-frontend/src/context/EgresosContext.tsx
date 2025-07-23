import React, { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import type { Gasto } from '../features/egresos/types';

// Define la URL de la API. Recuerda crear un archivo .env en tu frontend
// con VITE_API_ENDPOINT=http://localhost:3001/api
const API_URL = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3001/api';

interface EgresosContextType {
  gastos: Gasto[];
  cargarGastos: () => Promise<void>;
  agregarGasto: (gasto: Omit<Gasto, 'id'>) => Promise<void>;
  agregarGastos: (nuevosGastos: Omit<Gasto, 'id'>[]) => Promise<void>;
  borrarGasto: (id: Gasto['id']) => Promise<void>;
}

const EgresosContext = createContext<EgresosContextType | undefined>(undefined);

export const EgresosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gastos, setGastos] = useState<Gasto[]>([]);

  // Función para cargar los gastos desde el backend
  const cargarGastos = async () => {
    try {
      const response = await fetch(`${API_URL}/gastos`);
      if (!response.ok) {
        throw new Error('Error al cargar los gastos');
      }
      const data = await response.json();
      setGastos(data);
    } catch (error) {
      console.error(error);
      // Opcional: manejar el estado de error en la UI
    }
  };

  // Carga inicial de datos cuando el componente se monta
  useEffect(() => {
    cargarGastos();
  }, []);

  // Función para agregar un único gasto
  const agregarGasto = async (nuevoGasto: Omit<Gasto, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/gastos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoGasto),
      });
      if (!response.ok) {
        throw new Error('Error al agregar el gasto');
      }
      const gastoCreado = await response.json();
      // Actualiza el estado local con el gasto devuelto por la API (que ya tiene un ID)
      setGastos(prevGastos => [gastoCreado, ...prevGastos]);
    } catch (error) {
      console.error(error);
    }
  };

  // Función para agregar múltiples gastos (para la duplicación)
  const agregarGastos = async (nuevosGastos: Omit<Gasto, 'id'>[]) => {
     try {
        // Usamos Promise.all para enviar todas las peticiones en paralelo
        await Promise.all(
            nuevosGastos.map(gasto => fetch(`${API_URL}/gastos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gasto)
            }))
        );
        // Después de agregar todos, volvemos a cargar la lista completa
        // para asegurar que la UI esté 100% sincronizada.
        await cargarGastos();
    } catch (error) {
        console.error("Error al duplicar gastos:", error);
    }
  };

  // Función para borrar un gasto
  const borrarGasto = async (id: Gasto['id']) => {
    try {
        const response = await fetch(`${API_URL}/gastos/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Error al eliminar el gasto');
        }
        // Actualiza el estado local eliminando el gasto por su ID
        setGastos(prevGastos => prevGastos.filter(gasto => gasto.id !== id));
    } catch (error) {
        console.error(error);
    }
  };

  return (
    <EgresosContext.Provider value={{ gastos, cargarGastos, agregarGasto, agregarGastos, borrarGasto }}>
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