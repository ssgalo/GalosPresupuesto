const { Router } = require('express');
const pool = require('../db');

const router = Router();

// OBTENER TODOS LOS INGRESOS
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ingresos ORDER BY fecha_creacion DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// CREAR UN INGRESO
router.post('/', async (req, res) => {
  try {
    const { monto, origen, mes, year } = req.body;
    const newIngreso = await pool.query(
      `INSERT INTO ingresos (monto, origen, mes, year) 
       VALUES($1, $2, $3, $4) RETURNING *`,
      [monto, origen, mes, year]
    );
    res.status(201).json(newIngreso.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// BORRAR UN INGRESO
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM ingresos WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Ingreso no encontrado' });
        }
        res.status(200).json({ message: 'Ingreso eliminado', ingreso: result.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

module.exports = router;