const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const port = 3000;

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'agendacontactos'
};

const pool = mysql.createPool(dbConfig);

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET todos los contactos
app.get('/api/contactos', async (req, res) => {
  try {
    const [filas] = await pool.query('SELECT * FROM contactos ORDER BY id DESC');
    res.json(filas);
  } catch (error) {
    console.error('Error en GET /api/contactos:', error);
    res.status(500).json({ error: 'Error al obtener los contactos' });
  }
});

// contacto por ID
app.get('/api/contactos/:id', async (req, res) => {
  try {
    const [filas] = await pool.query('SELECT * FROM contactos WHERE id = ?', [req.params.id]);
    if (filas.length === 0) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    res.json(filas[0]);
  } catch (error) {
    console.error('Error en GET /api/contactos/:id:', error);
    res.status(500).json({ error: 'Error al obtener el contacto' });
  }
});

//  crear contacto
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

    res.status(201).json({
      id: resultado.insertId,
      nombre,
      telefono,
      gmail: gmail || ''
    });
  } catch (error) {
    console.error('Error en POST /api/contactos:', error);
    console.error(error);
    res.status(500).json({ error: 'Error al crear el contacto' });
  }
});

//post Referencia
app.post('/api/contactos', async (req, res) => {
  try {
    const { nombre, telefono, gmail, referencia } = req.body; // agregado

    if (!nombre || !telefono) {
      return res.status(400).json({ error: 'Nombre y teléfono son obligatorios' });
    }

    const [resultado] = await pool.query(
      'INSERT INTO contactos (nombre, telefono, gmail, referencia) VALUES (?, ?, ?, ?)', // agregado
      [nombre, telefono, gmail || '', referencia || ''] // agregado
    );

    res.status(201).json({
      id: resultado.insertId,
      nombre,
      telefono,
      gmail: gmail || '',
      referencia: referencia || '' // agregado
    });
  } catch (error) {
    console.error('Error en POST /api/contactos:', error);
    res.status(500).json({ error: 'Error al crear el contacto' });
  }
});

//  actualizar contacto
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

    res.json({
      id: req.params.id,
      nombre,
      telefono,
      gmail
    });
  } catch (error) {
    console.error('Error en PUT /api/contactos/:id:', error);
    res.status(500).json({ error: 'Error al actualizar el contacto' });
  }
});

//actualizar referencia
app.put('/api/contactos/:id', async (req, res) => {
  try {
    const { nombre, telefono, gmail, referencia } = req.body; // agregado

    const [resultado] = await pool.query(
      'UPDATE contactos SET nombre = ?, telefono = ?, gmail = ?, referencia = ? WHERE id = ?', // agregado
      [nombre, telefono, gmail, referencia, req.params.id] // agregado
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }

    res.json({ id: req.params.id, nombre, telefono, gmail, referencia }); // agregado
  } catch (error) {
    console.error('Error en PUT /api/contactos/:id:', error);
    res.status(500).json({ error: 'Error al actualizar el contacto' });
  }
});


//  eliminar contacto
app.delete('/api/contactos/:id', async (req, res) => {
  try {
    const [resultado] = await pool.query('DELETE FROM contactos WHERE id = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    res.json({ message: 'Contacto eliminado' });
  } catch (error) {
    console.error('Error en DELETE /api/contactos/:id:', error);
    res.status(500).json({ error: 'Error al eliminar el contacto' });
  }
});

// iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`Conectado a la base de datos: ${dbConfig.database}`);
});