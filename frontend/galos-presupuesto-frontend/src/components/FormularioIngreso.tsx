import React, { useState } from 'react';
import { useData } from '../context/DataContext'; // Reutilizamos el hook renombrado

interface FormularioIngresoProps {
  onClose: () => void;
  fechaSeleccionada: Date; 
}

const FormularioIngreso: React.FC<FormularioIngresoProps> = ({ onClose, fechaSeleccionada }) => {
  const { agregarIngreso } = useData();
  
  const [monto, setMonto] = useState('');
  const [origen, setOrigen] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto || !origen) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    await agregarIngreso({
      monto: parseFloat(monto),
      origen,
      mes: fechaSeleccionada.getMonth() + 1,
      year: fechaSeleccionada.getFullYear(),
    });
    
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="monto-ingreso" className="block text-sm font-medium text-gray-700">Monto</label>
        <input
          type="number"
          id="monto-ingreso"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ej: 100000"
        />
      </div>
      <div>
        <label htmlFor="origen" className="block text-sm font-medium text-gray-700">Origen del Ingreso</label>
        <input
          type="text"
          id="origen"
          value={origen}
          onChange={(e) => setOrigen(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ej: Salario"
        />
      </div>
      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-2 hover:bg-gray-300">Cancelar</button>
        <button type="submit" className="bg-green-600 text-black px-4 py-2 rounded-md hover:bg-green-700">Agregar Ingreso</button>
      </div>
    </form>
  );
};

export default FormularioIngreso;