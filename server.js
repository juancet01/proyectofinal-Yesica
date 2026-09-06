const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = 3000;

// Datos de conexión a MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'agendacontactos'
};

const pool = mysql.createPool(dbConfig);

// Le decimos a Express: "entendé el JSON que venga en el body de los pedidos"
app.use(express.json());

// Le decimos a Express: "cualquier archivo dentro de /public, servilo directo"
app.use(express.static(path.join(__dirname, 'public')));

// --- Rutas CRUD ---

// GET /api/contactos -> listar todos
app.get('/api/contactos', async (req, res) => {
  try {
    const [filas] = await pool.query('SELECT * FROM contactos ORDER BY id DESC');
    res.json(filas);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor', detalle: error.message });
  }
});

// GET /api/contactos/:id -> obtener uno
app.get('/api/contactos/:id', async (req, res) => {
  try {
    const [filas] = await pool.query('SELECT * FROM contactos WHERE id = ?', [req.params.id]);
    if (filas.length === 0) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    res.json(filas[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor', detalle: error.message });
  }
});

// POST /api/contactos -> crear
app.post('/api/contactos', async (req, res) => {
  try {
    const { nombre, telefono, gmail } = req.body;

    if (!nombre || !telefono) {
      return res.status(400).json({ error: 'Nombre y teléfono son obligatorios' });
    }

    const [resultado] = await pool.query(
      'INSERT INTO contactos (nombre, telefono, gmail) VALUES (?, ?, ?)',
      [nombre, telefono, gmail || '']
    );

    res.status(201).json({ id: resultado.insertId, nombre, telefono, gmail });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor', detalle: error.message });
  }
});

// PUT /api/contactos/:id -> editar
app.put('/api/contactos/:id', async (req, res) => {
  try {
    const { nombre, telefono, gmail } = req.body;

    const [resultado] = await pool.query(
      'UPDATE contactos SET nombre = ?, telefono = ?, gmail = ? WHERE id = ?',
      [nombre, telefono, gmail, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }

    res.json({ id: req.params.id, nombre, telefono, gmail });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor', detalle: error.message });
  }
});

// DELETE /api/contactos/:id -> eliminar
app.delete('/api/contactos/:id', async (req, res) => {
  try {
    const [resultado] = await pool.query('DELETE FROM contactos WHERE id = ?', [req.params.id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }

    res.json({ mensaje: 'Contacto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor', detalle: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Conectado a la base de datos: ${dbConfig.database}`);
});
