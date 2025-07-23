import React, { useState } from 'react';
import { useEgresos } from '../context/EgresosContext';

interface FormularioGastoProps {
  onClose: () => void;
  fechaSeleccionada: Date; 
}

const FormularioGasto: React.FC<FormularioGastoProps> = ({ onClose, fechaSeleccionada }) => {
  const { agregarGasto } = useEgresos();
  
  const [gasto, setGasto] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [medioPago, setMedioPago] = useState<'Tarjeta' | 'Efectivo'>('Tarjeta');
  const [cuotasTotales, setCuotasTotales] = useState('1');

  // La función ahora es asíncrona
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gasto || !monto || !categoria) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    try {
      await agregarGasto({
        gasto,
        monto: parseFloat(monto),
        categoria,
        medio_pago: medioPago,
        cuota_actual: 1,
        cuotas_totales: parseInt(cuotasTotales, 10),
        mes: fechaSeleccionada.getMonth() + 1,
        year: fechaSeleccionada.getFullYear(),
      });
      onClose(); // Cierra el modal solo si la operación fue exitosa
    } catch (error) {
        console.error("Error al crear el gasto:", error);
        alert("No se pudo crear el gasto. Inténtalo de nuevo.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="gasto" className="block text-sm font-medium text-gray-700">Nombre del Gasto</label>
        <input
          type="text"
          id="gasto"
          value={gasto}
          onChange={(e) => setGasto(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ej: Zapatillas"
        />
      </div>
      <div>
        <label htmlFor="monto" className="block text-sm font-medium text-gray-700">Monto</label>
        <input
          type="number"
          id="monto"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ej: 50000"
        />
      </div>
      <div>
        <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoría</label>
        <input
          type="text"
          id="categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ej: Ropa"
        />
      </div>
      <div>
        <label htmlFor="medioPago" className="block text-sm font-medium text-gray-700">Medio de Pago</label>
        <select 
            id="medioPago" 
            value={medioPago}
            onChange={(e) => setMedioPago(e.target.value as 'Tarjeta' | 'Efectivo')}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
            <option value="Tarjeta">Tarjeta</option>
            <option value="Efectivo">Efectivo</option>
        </select>
      </div>
      <div>
        <label htmlFor="cuotas" className="block text-sm font-medium text-gray-700">Cuotas Totales</label>
        <input
          type="number"
          id="cuotas"
          value={cuotasTotales}
          onChange={(e) => setCuotasTotales(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          min="1"
        />
      </div>
      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-2 hover:bg-gray-300">Cancelar</button>
        <button type="submit" className="bg-blue-600 text-black px-4 py-2 rounded-md hover:bg-blue-700">Agregar Gasto</button>
      </div>
    </form>
  );
};

export default FormularioGasto;