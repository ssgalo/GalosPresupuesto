import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDown, CreditCard, DollarSign, Plus, ChevronLeft, ChevronRight, ArrowLeft, Copy, Trash2, AlertTriangle } from 'lucide-react';
import { useEgresos } from '../../context/EgresosContext';
import Modal from '../../components/Modal';
import FormularioGasto from '../../components/FormularioGasto';
import type { Gasto } from '../egresos/types';

const API_URL = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3001/api';

const Presupuestos: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [notification, setNotification] = useState('');
  const [gastoIdParaBorrar, setGastoIdParaBorrar] = useState<Gasto['id'] | null>(null);

  // Se consumen las funciones actualizadas del contexto
  const { gastos, cargarGastos, borrarGasto } = useEgresos();

  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todos');
  const [filtroMedioPago, setFiltroMedioPago] = useState<string>('Todos');

  const handleMesAnterior = () => {
    setFechaSeleccionada(prevFecha => {
      const nuevaFecha = new Date(prevFecha);
      nuevaFecha.setMonth(nuevaFecha.getMonth() - 1);
      return nuevaFecha;
    });
  };

  const handleMesSiguiente = () => {
    setFechaSeleccionada(prevFecha => {
      const nuevaFecha = new Date(prevFecha);
      nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
      return nuevaFecha;
    });
  };

  const handleAnioAnterior = () => {
    setFechaSeleccionada(prevFecha => {
      const nuevaFecha = new Date(prevFecha);
      nuevaFecha.setFullYear(nuevaFecha.getFullYear() - 1);
      return nuevaFecha;
    });
  };

  const handleAnioSiguiente = () => {
    setFechaSeleccionada(prevFecha => {
      const nuevaFecha = new Date(prevFecha);
      nuevaFecha.setFullYear(nuevaFecha.getFullYear() + 1);
      return nuevaFecha;
    });
  };

  const gastosFiltrados = useMemo(() => {
    // La propiedad 'monto' en la DB es un string, hay que convertirlo a número
    return gastos.map(g => ({...g, monto: Number(g.monto)})).filter(gasto => {
      const pasaCategoria = filtroCategoria === 'Todos' || gasto.categoria === filtroCategoria;
      const pasaMedioPago = filtroMedioPago === 'Todos' || gasto.medio_pago === filtroMedioPago;
      const pasaMes = gasto.mes === fechaSeleccionada.getMonth() + 1;
      const pasaYear = gasto.year === fechaSeleccionada.getFullYear();
      return pasaCategoria && pasaMedioPago && pasaMes && pasaYear;
    });
  }, [gastos, filtroCategoria, filtroMedioPago, fechaSeleccionada]);
  
  const categorias = useMemo(() => ['Todos', ...Array.from(new Set(gastos.map(g => g.categoria)))], [gastos]);
  const mediosPago = useMemo(() => ['Todos', ...Array.from(new Set(gastos.map(g => g.medio_pago)))], [gastos]);

  const totalGastado = useMemo(() => {
    return gastosFiltrados.reduce((acc, gasto) => acc + gasto.monto, 0);
  }, [gastosFiltrados]);

  const datosGrafico = useMemo(() => {
    const gastosPorCategoria: { [key: string]: number } = {};
    gastosFiltrados.forEach(gasto => {
      if (!gastosPorCategoria[gasto.categoria]) {
        gastosPorCategoria[gasto.categoria] = 0;
      }
      gastosPorCategoria[gasto.categoria] += gasto.monto;
    });
    return Object.keys(gastosPorCategoria).map(categoria => ({
      name: categoria,
      monto: gastosPorCategoria[categoria]
    }));
  }, [gastosFiltrados]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
  };
  
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
        setNotification('');
    }, 3000);
  };

  const handleDuplicarGastos = async () => {
    const sourceMonth = fechaSeleccionada.getMonth() + 1; // getMonth es 0-11
    const sourceYear = fechaSeleccionada.getFullYear();

    try {
      const response = await fetch(`${API_URL}/gastos/duplicar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sourceMonth, sourceYear }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al duplicar los gastos');
      }

      showNotification(result.message);
      
      // Si se duplicaron gastos, recargamos la lista para ver los cambios
      if (result.duplicated && result.duplicated.length > 0) {
        await cargarGastos();
      }

    } catch (error) {
      console.error(error);
      showNotification('Ocurrió un error al intentar duplicar.');
    }
  };

  const hayGastosParaDuplicar = useMemo(() => {
    return gastosFiltrados.some(
        gasto => gasto.cuotas_totales > 1 && gasto.cuota_actual < gasto.cuotas_totales
    );
  }, [gastosFiltrados]);

  const handleConfirmarBorrado = async () => {
    if (gastoIdParaBorrar) {
        await borrarGasto(gastoIdParaBorrar);
        setGastoIdParaBorrar(null);
        showNotification("Gasto eliminado correctamente.");
    }
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen font-sans text-gray-800 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => (window.location.href = "/")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-4 p-2 rounded-lg hover:bg-gray-100 -ml-2"
            aria-label="Volver a la página principal"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Volver</span>
          </button>
          <header className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resumen de Presupuesto</h1>
              <div className="flex items-center gap-4 mt-2">
                   <button onClick={handleAnioAnterior} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><ChevronLeft size={20} /></button>
                   <p className="text-xl font-semibold text-gray-700 w-24 text-center">{fechaSeleccionada.getFullYear()}</p>
                   <button onClick={handleAnioSiguiente} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><ChevronRight size={20} /></button>
                   
                   <button onClick={handleMesAnterior} className="p-2 rounded-full hover:bg-gray-200 transition-colors ml-4"><ChevronLeft size={20} /></button>
                   <p className="text-xl font-semibold text-gray-700 w-32 text-center capitalize">{fechaSeleccionada.toLocaleDateString('es-AR', { month: 'long' })}</p>
                   <button onClick={handleMesSiguiente} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><ChevronRight size={20} /></button>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center bg-indigo-600 text-black font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors mt-2"
            >
              <Plus size={20} className="mr-2"/>
              Agregar Gasto
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:col-span-2">
                   <h2 className="text-sm font-medium text-gray-500">Total Gastado del Mes</h2>
                   <p className="text-3xl font-bold text-blue-600 mt-2">{formatCurrency(totalGastado)}</p>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                   <h2 className="text-sm font-medium text-gray-500">Mes</h2>
                   <p className="text-3xl font-bold mt-2 capitalize">{fechaSeleccionada.toLocaleDateString('es-AR', { month: 'long' })}</p>
               </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                   <h2 className="text-sm font-medium text-gray-500">Año</h2>
                   <p className="text-3xl font-bold mt-2">{fechaSeleccionada.getFullYear()}</p>
               </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Gastos por Categoría</h2>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={datosGrafico} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `$${Number(value)/1000}k`} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Monto']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(5px)',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb',
                      }}
                    />
                    <Legend wrapperStyle={{fontSize: "14px"}}/>
                    <Bar dataKey="monto" fill="#3b82f6" name="Monto Gastado" barSize={30} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Filtros</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <div className="relative">
                    <select
                      id="categoria"
                      value={filtroCategoria}
                      onChange={(e) => setFiltroCategoria(e.target.value)}
                      className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    >
                      {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label htmlFor="medio_pago" className="block text-sm font-medium text-gray-700 mb-1">Medio de Pago</label>
                  <div className="relative">
                    <select
                      id="medio_pago"
                      value={filtroMedioPago}
                      onChange={(e) => setFiltroMedioPago(e.target.value)}
                      className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    >
                      {mediosPago.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Detalle de Gastos</h2>
                <button
                    onClick={handleDuplicarGastos}
                    disabled={!hayGastosParaDuplicar}
                    className="flex items-center bg-teal-500 text-black font-semibold px-3 py-2 rounded-lg shadow-sm hover:bg-teal-600 transition-colors text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    <Copy size={16} className="mr-2"/>
                    Duplicar
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Gasto</th>
                      <th scope="col" className="px-6 py-3">Categoría</th>
                      <th scope="col" className="px-6 py-3">Medio de Pago</th>
                      <th scope="col" className="px-6 py-3 text-right">Monto</th>
                      <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gastosFiltrados.length > 0 ? (
                      gastosFiltrados.map((gasto) => (
                        <tr key={gasto.id} className="bg-white border-b hover:bg-gray-50">
                          <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {gasto.gasto}
                            {gasto.cuotas_totales > 1 ? (
                              <span className="text-xs text-gray-400 ml-2 block">
                                Cuota {gasto.cuota_actual}/{gasto.cuotas_totales}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 ml-2 block">
                                Único pago
                              </span>
                            )}
                          </th>
                          <td className="px-6 py-4">{gasto.categoria}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              gasto.medio_pago === 'Tarjeta' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {gasto.medio_pago === 'Tarjeta' 
                                  ? <CreditCard className="w-3 h-3 mr-1.5" /> 
                                  : <DollarSign className="w-3 h-3 mr-1.5" />}
                              {gasto.medio_pago}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-gray-900">{formatCurrency(gasto.monto)}</td>
                          <td className="px-6 py-4 text-center">
                            <button onClick={() => setGastoIdParaBorrar(gasto.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors">
                                <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          No se encontraron gastos para este mes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Agregar Nuevo Gasto"
      >
        <FormularioGasto 
          onClose={() => setIsModalOpen(false)}
          fechaSeleccionada={fechaSeleccionada}
        />
      </Modal>

      <Modal
        isOpen={gastoIdParaBorrar !== null}
        onClose={() => setGastoIdParaBorrar(null)}
        title="Confirmar Eliminación"
      >
        <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-normal text-gray-600">
                ¿Estás seguro de que deseas eliminar este gasto?
            </h3>
            <p className="mb-5 text-sm text-gray-500">
                Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => setGastoIdParaBorrar(null)}
                    className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleConfirmarBorrado}
                    className="bg-red-600 text-black font-semibold px-4 py-2 rounded-lg hover:bg-red-700"
                >
                    Sí, eliminar
                </button>
            </div>
        </div>
      </Modal>
      
      {notification && (
        <div className="fixed bottom-5 right-5 bg-gray-800 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-pulse">
            {notification}
        </div>
      )}
    </>
  );
};

export default Presupuestos;