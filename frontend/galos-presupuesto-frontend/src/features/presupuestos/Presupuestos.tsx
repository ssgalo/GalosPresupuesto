import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { /*ChevronDown, CreditCard, DollarSign, ArrowLeft, */ Plus, Edit, ChevronLeft, ChevronRight, Copy, Trash2, AlertTriangle, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { useData } from '../../context/DataContext'; // Hook actualizado
import Modal from '../../components/Modal';
import FormularioGasto from '../../components/FormularioGasto';
import FormularioIngreso from '../../components/FormularioIngreso'; // Importar nuevo formulario
import type { Gasto, Ingreso } from '../egresos/types';

const API_URL = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3001/api';

const Presupuestos: React.FC = () => {
  const [isGastoModalOpen, setIsGastoModalOpen] = useState(false);
  const [isIngresoModalOpen, setIsIngresoModalOpen] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [notification, setNotification] = useState('');
  const [gastoIdParaBorrar, setGastoIdParaBorrar] = useState<Gasto['id'] | null>(null);
  const [ingresoIdParaBorrar, setIngresoIdParaBorrar] = useState<Ingreso['id'] | null>(null);
  const { gastos, ingresos, borrarGasto, borrarIngreso, cargarDatos } = useData();
  const [gastoParaEditar, setGastoParaEditar] = useState<Gasto | null>(null);

  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todos');
  const [filtroMedioPago, setFiltroMedioPago] = useState<string>('Todos');

  const handleMesAnterior = () => setFechaSeleccionada(d => new Date(d.setMonth(d.getMonth() - 1)));
  const handleMesSiguiente = () => setFechaSeleccionada(d => new Date(d.setMonth(d.getMonth() + 1)));
  const handleAnioAnterior = () => setFechaSeleccionada(d => new Date(d.setFullYear(d.getFullYear() - 1)));
  const handleAnioSiguiente = () => setFechaSeleccionada(d => new Date(d.setFullYear(d.getFullYear() + 1)));

  const { gastosFiltrados, ingresosFiltrados } = useMemo(() => {
    const currentMonth = fechaSeleccionada.getMonth() + 1;
    const currentYear = fechaSeleccionada.getFullYear();
    const filteredGastos = gastos
      .map(g => ({ ...g, monto: Number(g.monto) }))
      .filter(g =>
        g.mes === currentMonth && g.year === currentYear &&
        (filtroCategoria === 'Todos' || g.categoria === filtroCategoria) &&
        (filtroMedioPago === 'Todos' || g.medio_pago === filtroMedioPago)
      );
    const filteredIngresos = ingresos
      .map(i => ({ ...i, monto: Number(i.monto) }))
      .filter(i => i.mes === currentMonth && i.year === currentYear);
    return { gastosFiltrados: filteredGastos, ingresosFiltrados: filteredIngresos };
  }, [gastos, ingresos, filtroCategoria, filtroMedioPago, fechaSeleccionada]);

  const categorias = useMemo(() => ['Todos', ...Array.from(new Set(gastos.map(g => g.categoria)))], [gastos]);
  const mediosPago = useMemo(() => ['Todos', ...Array.from(new Set(gastos.map(g => g.medio_pago)))], [gastos]);

  const totalGastado = useMemo(() => gastosFiltrados.reduce((acc, g) => acc + g.monto, 0), [gastosFiltrados]);
  const totalIngresado = useMemo(() => ingresosFiltrados.reduce((acc, i) => acc + i.monto, 0), [ingresosFiltrados]);
  const balance = useMemo(() => totalIngresado - totalGastado, [totalIngresado, totalGastado]);

  const datosGrafico = useMemo(() => {
    const gastosPorCategoria: { [key: string]: number } = {};
    gastosFiltrados.forEach(gasto => {
      gastosPorCategoria[gasto.categoria] = (gastosPorCategoria[gasto.categoria] || 0) + gasto.monto;
    });
    return Object.entries(gastosPorCategoria).map(([name, monto]) => ({ name, monto }));
  }, [gastosFiltrados]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleDuplicarGastos = async () => {
    const sourceMonth = fechaSeleccionada.getMonth() + 1;
    const sourceYear = fechaSeleccionada.getFullYear();
    try {
      const response = await fetch(`${API_URL}/gastos/duplicar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceMonth, sourceYear }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      showNotification(result.message);
      if (result.duplicated?.length > 0) await cargarDatos();
    } catch (error) {
      console.error(error);
      showNotification('Ocurrió un error al intentar duplicar.');
    }
  };

  const hayGastosParaDuplicar = useMemo(() => gastosFiltrados.some(g => g.cuota_actual < g.cuotas_totales), [gastosFiltrados]);

  const handleConfirmarBorradoGasto = async () => {
    if (gastoIdParaBorrar) {
      await borrarGasto(gastoIdParaBorrar);
      setGastoIdParaBorrar(null);
      showNotification("Gasto eliminado correctamente.");
    }
  };

  // --- INICIO: NUEVA FUNCIÓN PARA BORRAR INGRESOS ---
  const handleConfirmarBorradoIngreso = async () => {
    if (ingresoIdParaBorrar) {
      await borrarIngreso(ingresoIdParaBorrar);
      setIngresoIdParaBorrar(null);
      showNotification("Ingreso eliminado correctamente.");
    }
  };
  // --- FIN: NUEVA FUNCIÓN ---

  const handleAbrirModalEdicion = (gasto: Gasto) => {
    setGastoParaEditar(gasto);
    setIsGastoModalOpen(true);
  };

  const handleCerrarModalGasto = () => {
    setIsGastoModalOpen(false);
    setGastoParaEditar(null);
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen font-sans text-gray-800 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header y Navegación de Fecha */}
          <header className="mb-8 flex justify-between items-start flex-wrap gap-4">
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
            <div className="flex gap-2 mt-2">
              <button onClick={() => setIsIngresoModalOpen(true)} className="flex items-center bg-green-600 text-black font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-green-700 transition-colors">
                <Plus size={20} className="mr-2" /> Agregar Ingreso
              </button>
              <button onClick={() => setIsGastoModalOpen(true)} className="flex items-center bg-indigo-600 text-black font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                <Plus size={20} className="mr-2" /> Agregar Gasto
              </button>
            </div>
          </header>

          {/* Tarjetas de Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200 flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-full"><TrendingUp className="h-6 w-6 text-green-600" /></div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Total Ingresado</h2>
                <p className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(totalIngresado)}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200 flex items-start gap-4">
              <div className="bg-red-100 p-3 rounded-full"><TrendingDown className="h-6 w-6 text-red-600" /></div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Total Gastado</h2>
                <p className="text-3xl font-bold text-red-600 mt-1">{formatCurrency(totalGastado)}</p>
              </div>
            </div>
            <div className={`bg-white p-6 rounded-xl shadow-sm border ${balance >= 0 ? 'border-blue-200' : 'border-orange-200'} flex items-start gap-4`}>
              <div className={`p-3 rounded-full ${balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}><Scale className={`h-6 w-6 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} /></div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Balance del Mes</h2>
                <p className={`text-3xl font-bold mt-1 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{formatCurrency(balance)}</p>
              </div>
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
                    <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Monto']} />
                    <Legend />
                    <Bar dataKey="monto" fill="#3b82f6" name="Monto Gastado" barSize={30} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Filtros de Gastos</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select id="categoria" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="medio_pago" className="block text-sm font-medium text-gray-700 mb-1">Medio de Pago</label>
                  <select id="medio_pago" value={filtroMedioPago} onChange={(e) => setFiltroMedioPago(e.target.value)} className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
                    {mediosPago.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Detalle de Gastos</h2>
                <button onClick={handleDuplicarGastos} disabled={!hayGastosParaDuplicar} className="flex items-center bg-teal-500 text-black font-semibold px-3 py-2 rounded-lg shadow-sm hover:bg-teal-600 transition-colors text-sm disabled:bg-gray-300 disabled:cursor-not-allowed">
                  <Copy size={16} className="mr-2" /> Duplicar
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
                      <th scope="col" className="px-6 py-3 text-right">Cuota</th>
                      <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gastosFiltrados.length > 0 ? (
                      gastosFiltrados.map((gasto) => (
                        <tr key={gasto.id} className="bg-white border-b hover:bg-gray-50">
                          <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{gasto.gasto}</th>
                          <td className="px-6 py-4">{gasto.categoria}</td>
                          <td className="px-6 py-4">{gasto.medio_pago}</td>
                          <td className="px-6 py-4 text-right font-mono">{formatCurrency(gasto.monto)}</td>
                          <td className="px-6 py-4 text-center text-sm">
                            {gasto.gasto_fijo ? (
                              <span className="font-semibold text-blue-600">Fijo</span>
                            ) : gasto.cuotas_totales > 1 ? (
                              <span>{gasto.cuota_actual} / {gasto.cuotas_totales}</span>
                            ) : (
                              <span className="text-gray-500">Único</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center items-center gap-2">
                              <button onClick={() => handleAbrirModalEdicion(gasto)} className="text-blue-500 hover:text-blue-700 p-1">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => setGastoIdParaBorrar(gasto.id)} className="text-red-500 hover:text-red-700 p-1">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (<tr><td colSpan={5} className="text-center py-8 text-gray-500">No se encontraron gastos.</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>

            {/* --- INICIO: NUEVA TABLA DE INGRESOS --- */}
            <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Detalle de Ingresos</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Origen</th>
                      <th scope="col" className="px-6 py-3 text-right">Monto</th>
                      <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingresosFiltrados.length > 0 ? (
                      ingresosFiltrados.map((ingreso) => (
                        <tr key={ingreso.id} className="bg-white border-b hover:bg-gray-50">
                          <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{ingreso.origen}</th>
                          <td className="px-6 py-4 text-right font-mono">{formatCurrency(ingreso.monto)}</td>
                          <td className="px-6 py-4 text-center">
                            <button onClick={() => setIngresoIdParaBorrar(ingreso.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))
                    ) : (<tr><td colSpan={3} className="text-center py-8 text-gray-500">No se encontraron ingresos.</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
            {/* --- FIN: NUEVA TABLA DE INGRESOS --- */}

          </div>
        </div>
      </div>

      <Modal isOpen={isGastoModalOpen} onClose={handleCerrarModalGasto} title={gastoParaEditar ? "Editar Gasto" : "Agregar Nuevo Gasto"}>
        <FormularioGasto
          onClose={handleCerrarModalGasto}
          fechaSeleccionada={fechaSeleccionada}
          gastoParaEditar={gastoParaEditar}
        />
      </Modal>
      <Modal isOpen={isIngresoModalOpen} onClose={() => setIsIngresoModalOpen(false)} title="Agregar Nuevo Ingreso">
        <FormularioIngreso onClose={() => setIsIngresoModalOpen(false)} fechaSeleccionada={fechaSeleccionada} />
      </Modal>

      <Modal isOpen={gastoIdParaBorrar !== null} onClose={() => setGastoIdParaBorrar(null)} title="Confirmar Eliminación de Gasto">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg">¿Estás seguro de que deseas eliminar este gasto?</h3>
          <div className="flex justify-center gap-4 mt-5">
            <button onClick={() => setGastoIdParaBorrar(null)} className="bg-gray-200 px-4 py-2 rounded-lg">Cancelar</button>
            <button onClick={handleConfirmarBorradoGasto} className="bg-red-600 text-black px-4 py-2 rounded-lg">Sí, eliminar</button>
          </div>
        </div>
      </Modal>

      {/* --- INICIO: NUEVO MODAL PARA BORRAR INGRESOS --- */}
      <Modal isOpen={ingresoIdParaBorrar !== null} onClose={() => setIngresoIdParaBorrar(null)} title="Confirmar Eliminación de Ingreso">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg">¿Estás seguro de que deseas eliminar este ingreso?</h3>
          <div className="flex justify-center gap-4 mt-5">
            <button onClick={() => setIngresoIdParaBorrar(null)} className="bg-gray-200 px-4 py-2 rounded-lg">Cancelar</button>
            <button onClick={handleConfirmarBorradoIngreso} className="bg-red-600 text-black px-4 py-2 rounded-lg">Sí, eliminar</button>
          </div>
        </div>
      </Modal>
      {/* --- FIN: NUEVO MODAL PARA BORRAR INGRESOS --- */}

      {notification && (
        <div className="fixed bottom-5 right-5 bg-gray-800 text-white py-2 px-4 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}
    </>
  );
};

export default Presupuestos;