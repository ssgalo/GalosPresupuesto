import { Routes, Route } from 'react-router-dom';
import Home from './features/home/Home';
import Presupuestos from './features/presupuestos/Presupuestos';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/presupuestos" element={<Presupuestos />} />
      <Route path="/configuracion" element={<div>Configuración (futuro)</div>} />
    </Routes>
  );
}

export default App;
