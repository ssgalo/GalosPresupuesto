import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import type { Gasto } from '../features/egresos/types';

interface FormularioGastoProps {
  onClose: () => void;
  fechaSeleccionada: Date; 
  gastoParaEditar?: Gasto | null;
}

const FormularioGasto: React.FC<FormularioGastoProps> = ({ onClose, fechaSeleccionada, gastoParaEditar }) => {
  const { agregarGasto, editarGasto } = useData();
  
  const [gasto, setGasto] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [medioPago, setMedioPago] = useState<'Tarjeta' | 'Efectivo'>('Tarjeta');
  const [cuotasTotales, setCuotasTotales] = useState('1');
  const [cuotaActual, setCuotaActual] = useState('1');
  const [esFijo, setEsFijo] = useState(false);

  const esModoEdicion = !!gastoParaEditar;

  useEffect(() => {
    if (esModoEdicion && gastoParaEditar) {
      setGasto(gastoParaEditar.gasto);
      setMonto(String(gastoParaEditar.monto));
      setCategoria(gastoParaEditar.categoria);
      setMedioPago(gastoParaEditar.medio_pago);
      setCuotasTotales(String(gastoParaEditar.cuotas_totales));
      setCuotaActual(String(gastoParaEditar.cuota_actual));
      setEsFijo(gastoParaEditar.gasto_fijo || false);
    }
  }, [gastoParaEditar, esModoEdicion]);

  // La función ahora es asíncrona
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gasto || !monto || !categoria) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const datosGasto = {
      gasto,
      monto: parseFloat(monto),
      categoria,
      medio_pago: medioPago,
      cuota_actual: parseInt(cuotaActual, 10),
      cuotas_totales: esFijo ? 1 : parseInt(cuotasTotales, 10),
      gasto_fijo: esFijo,
    };

    if (esModoEdicion && gastoParaEditar) {
      await editarGasto(gastoParaEditar.id, datosGasto);
    } else {
      await agregarGasto({
        ...datosGasto,
        mes: fechaSeleccionada.getMonth() + 1,
        year: fechaSeleccionada.getFullYear(),
      });
    }
    
    onClose();
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
      <div className="flex items-center">
        <input
          id="gasto-fijo"
          type="checkbox"
          checked={esFijo}
          onChange={(e) => setEsFijo(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="gasto-fijo" className="ml-2 block text-sm text-gray-900">
          Marcar como gasto fijo (se repite mensualmente)
        </label>
      </div>
      {!esFijo && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cuota-actual" className="block text-sm font-medium text-gray-700">Cuota Actual</label>
            <input type="number" id="cuota-actual" value={cuotaActual} onChange={(e) => setCuotaActual(e.target.value)} className="mt-1 block w-full input-style" min="1"/>
          </div>
          <div>
            <label htmlFor="cuotas-totales" className="block text-sm font-medium text-gray-700">Cuotas Totales</label>
            <input type="number" id="cuotas-totales" value={cuotasTotales} onChange={(e) => setCuotasTotales(e.target.value)} className="mt-1 block w-full input-style" min="1"/>
          </div>
        </div>
      )}
      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-2 hover:bg-gray-300">Cancelar</button>
        <button type="submit" className="bg-blue-600 text-black px-4 py-2 rounded-md hover:bg-blue-700">Agregar Gasto</button>
      </div>
    </form>
  );
};

export default FormularioGasto;