const express = require('express');
const cors = require('cors');
const gastosRoutes = require('./routes/gastos');
const ingresosRoutes = require('./routes/ingresos');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors()); // Permite la comunicación entre frontend y backend
app.use(express.json()); // Permite al servidor entender JSON

// Rutas
app.get('/', (req, res) => {
  res.send('API de Presupuestos funcionando!');
});

app.use('/api/gastos', gastosRoutes);
app.use('/api/ingresos', ingresosRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});