// server.js
// Servidor con Node.js "puro" (módulo http, sin Express)
// conectado a una base de datos MySQL real.

const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');
const mysql = require('mysql2/promise'); // versión con promesas, más cómoda con async/await

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// --- Datos de conexión a MySQL ---
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'agendacontactos'
};

// Creamos un "pool" de conexiones: en vez de abrir/cerrar una conexión
// por cada petición, se reutilizan varias conexiones ya abiertas (más eficiente).
const pool = mysql.createPool(dbConfig);

// Junta el "body" de una petición POST/PUT (llega en pedacitos)
function leerCuerpo(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function enviarJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function servirArchivoEstatico(req, res, pathname) {
  let rutaArchivo = pathname === '/' ? '/index.html' : pathname;
  rutaArchivo = path.join(PUBLIC_DIR, rutaArchivo);

  const extension = path.extname(rutaArchivo);
  const tiposMime = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript'
  };

  fs.readFile(rutaArchivo, (error, contenido) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Archivo no encontrado');
      return;
    }
    res.writeHead(200, { 'Content-Type': tiposMime[extension] || 'text/plain' });
    res.end(contenido);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const metodo = req.method;

  if (pathname.startsWith('/api/contactos')) {
    const partes = pathname.split('/').filter(Boolean);
    const id = partes[2]; // undefined si es /api/contactos, o el id si es /api/contactos/5

    try {
      // GET /api/contactos -> listar todos
      if (metodo === 'GET' && !id) {
        const [filas] = await pool.query('SELECT * FROM contactos ORDER BY id DESC');
        return enviarJSON(res, 200, filas);
      }

      // GET /api/contactos/:id -> obtener uno
      if (metodo === 'GET' && id) {
        const [filas] = await pool.query('SELECT * FROM contactos WHERE id = ?', [id]);
        if (filas.length === 0) return enviarJSON(res, 404, { error: 'Contacto no encontrado' });
        return enviarJSON(res, 200, filas[0]);
      }

      // POST /api/contactos -> crear
      if (metodo === 'POST' && !id) {
        const body = await leerCuerpo(req);
        const { nombre, telefono, gmail } = body;

        if (!nombre || !telefono) {
          return enviarJSON(res, 400, { error: 'Nombre y teléfono son obligatorios' });
        }

        const [resultado] = await pool.query(
          'INSERT INTO contactos (nombre, telefono, gmail) VALUES (?, ?, ?)',
          [nombre, telefono, gmail || '']
        );

        return enviarJSON(res, 201, { id: resultado.insertId, nombre, telefono, gmail });
      }

      // PUT /api/contactos/:id -> editar
      if (metodo === 'PUT' && id) {
        const body = await leerCuerpo(req);
        const { nombre, telefono, gmail } = body;

        const [resultado] = await pool.query(
          'UPDATE contactos SET nombre = ?, telefono = ?, gmail = ? WHERE id = ?',
          [nombre, telefono, gmail, id]
        );

        if (resultado.affectedRows === 0) {
          return enviarJSON(res, 404, { error: 'Contacto no encontrado' });
        }

        return enviarJSON(res, 200, { id, nombre, telefono, gmail });
      }

      // DELETE /api/contactos/:id -> eliminar
      if (metodo === 'DELETE' && id) {
        const [resultado] = await pool.query('DELETE FROM contactos WHERE id = ?', [id]);

        if (resultado.affectedRows === 0) {
          return enviarJSON(res, 404, { error: 'Contacto no encontrado' });
        }

        return enviarJSON(res, 200, { mensaje: 'Contacto eliminado correctamente' });
      }

      return enviarJSON(res, 404, { error: 'Ruta no encontrada' });

    } catch (error) {
      console.error(error);
      return enviarJSON(res, 500, { error: 'Error en el servidor', detalle: error.message });
    }
  }

  servirArchivoEstatico(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Conectado a la base de datos: ${dbConfig.database}`);
});