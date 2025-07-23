const { Router } = require('express');
const pool = require('../db');

const router = Router();

// OBTENER TODOS LOS GASTOS
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gastos ORDER BY fecha_creacion DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// CREAR UN GASTO
router.post('/', async (req, res) => {
  try {
    const { gasto, monto, categoria, medio_pago, mes, year, cuota_actual, cuotas_totales } = req.body;
    const newGasto = await pool.query(
      `INSERT INTO gastos (gasto, monto, categoria, medio_pago, mes, year, cuota_actual, cuotas_totales) 
       VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [gasto, monto, categoria, medio_pago, mes, year, cuota_actual, cuotas_totales]
    );
    res.status(201).json(newGasto.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// BORRAR UN GASTO
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM gastos WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Gasto no encontrado' });
        }
        res.status(200).json({ message: 'Gasto eliminado', gasto: result.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});


module.exports = router;