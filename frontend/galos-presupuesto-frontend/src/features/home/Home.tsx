import { useNavigate } from 'react-router-dom';
import './home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Bienvenido a <span className="logo">GalosPresupuesto</span></h1>
      <div className="buttons">
        <button onClick={() => navigate('/presupuestos')}>Presupuestos Mensuales</button>
        <button onClick={() => navigate('/configuracion')}>Configuración</button>
      </div>
    </div>
  );
};

export default Home;