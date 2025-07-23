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

router.post('/duplicar', async (req, res) => {
  const { sourceMonth, sourceYear } = req.body;

  if (!sourceMonth || !sourceYear) {
    return res.status(400).json({ message: 'Faltan mes y año de origen.' });
  }

  // 1. Calcular mes y año de destino
  let targetMonth = sourceMonth + 1;
  let targetYear = sourceYear;
  if (targetMonth > 12) {
    targetMonth = 1;
    targetYear++;
  }

  const client = await pool.connect();

  try {
    // 2. Obtener los gastos del mes de origen que tienen cuotas pendientes
    const gastosParaDuplicar = await client.query(
      'SELECT * FROM gastos WHERE mes = $1 AND year = $2 AND cuota_actual < cuotas_totales',
      [sourceMonth, sourceYear]
    );

    if (gastosParaDuplicar.rows.length === 0) {
      return res.status(200).json({ message: 'No hay gastos con cuotas para duplicar en el mes siguiente.', duplicated: [] });
    }

    // 3. Preparar los nuevos gastos para la inserción
    const values = gastosParaDuplicar.rows.map(g => {
      return `('${g.gasto.replace(/'/g, "''")}', ${g.monto}, '${g.categoria}', '${g.medio_pago}', ${targetMonth}, ${targetYear}, ${g.cuota_actual + 1}, ${g.cuotas_totales})`;
    }).join(',');

    const insertQuery = `
      INSERT INTO gastos (gasto, monto, categoria, medio_pago, mes, year, cuota_actual, cuotas_totales) 
      VALUES ${values} RETURNING *;
    `;

    // 4. Iniciar transacción e insertar los nuevos gastos
    await client.query('BEGIN');
    const result = await client.query(insertQuery);
    await client.query('COMMIT');

    res.status(201).json({
      message: `${result.rows.length} gasto(s) duplicado(s) exitosamente.`,
      duplicated: result.rows
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error al duplicar gastos:", error.message);
    res.status(500).json({ message: 'Error en el servidor al duplicar los gastos' });
  } finally {
    client.release();
  }
});

module.exports = router;