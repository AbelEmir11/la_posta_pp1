// api/productos.js
import pool from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Solo GET permitido' });
    return;
  }
  try {
    const { rows } = await pool.query('SELECT * FROM productos');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
}
