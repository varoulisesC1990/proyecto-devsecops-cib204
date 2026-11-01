const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { execFile } = require('child_process');
const net = require('net');
const cifrado = require('./cifrado');
const db = require('./db');
const config = require('./config');
const { requiereAuth } = require('./auth');

// API stateless: autentica con Authorization: Bearer, no con cookies.
// nosemgrep: javascript.express.security.audit.express-check-csurf-middleware-usage.express-check-csurf-middleware-usage
const app = express();
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => callback(null, !origin || config.CORS_ORIGINS.includes(origin)),
}));
app.use(express.json({ limit: '16kb' }));

const llaves = cifrado.generarLlaves();

app.get('/salud', (req, res) => {
  res.json({ estado: 'ok', version: '1.0' });
});

app.get('/llave', (req, res) => {
  res.json({ llavePublica: llaves.publicKey });
});

app.post('/cifrar', requiereAuth, (req, res) => {
  const { texto } = req.body || {};
  if (typeof texto !== 'string' || Buffer.byteLength(texto, 'utf8') > 190) {
    return res.status(400).json({ error: 'Texto inválido o demasiado largo' });
  }

  try {
    return res.json({ cifrado: cifrado.cifrar(texto, llaves.publicKey) });
  } catch {
    return res.status(400).json({ error: 'No se pudo cifrar el texto' });
  }
});

app.post('/descifrar', requiereAuth, (req, res) => {
  const { cifrado: cifradoTxt } = req.body || {};
  if (typeof cifradoTxt !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(cifradoTxt)) {
    return res.status(400).json({ error: 'Cifrado inválido' });
  }

  try {
    const bytes = Buffer.from(cifradoTxt, 'base64');
    if (bytes.length !== 256 || bytes.toString('base64') !== cifradoTxt) {
      return res.status(400).json({ error: 'Cifrado inválido' });
    }
    return res.json({ descifrado: cifrado.descifrar(cifradoTxt, llaves.privateKey) });
  } catch {
    return res.status(400).json({ error: 'No se pudo descifrar el texto' });
  }
});

app.get('/buscar', requiereAuth, (req, res, next) => {
  const { nombre } = req.query;
  if (typeof nombre !== 'string' || nombre.length > 100) {
    return res.status(400).json({ error: 'Nombre inválido' });
  }

  db.buscarBitacora(nombre, (err, filas) => {
    if (err) return next(err);
    return res.json({ filas });
  });
});

app.post('/calcular', requiereAuth, (req, res) => {
  const { numeros } = req.body || {};
  if (
    !Array.isArray(numeros)
    || numeros.length === 0
    || numeros.length > 100
    || !numeros.every((numero) => Number.isFinite(numero))
  ) {
    return res.status(400).json({ error: 'Se requiere una lista válida de números' });
  }

  const resultado = numeros.reduce((suma, numero) => suma + numero, 0);
  if (!Number.isFinite(resultado)) {
    return res.status(400).json({ error: 'Resultado fuera de rango' });
  }
  return res.json({ resultado });
});

app.get('/diagnostico', requiereAuth, (req, res) => {
  const { host } = req.query;
  if (typeof host !== 'string' || net.isIP(host) === 0) {
    return res.status(400).json({ error: 'Se requiere una dirección IP válida' });
  }

  execFile('ping', ['-c', '1', '-W', '2', '--', host], {
    timeout: 3000,
    maxBuffer: 1024,
  }, (err, stdout) => {
    if (err) return res.status(502).json({ error: 'No se pudo completar el diagnóstico' });
    return res.json({ salida: stdout });
  });
});

app.use((err, req, res, next) => {
  void next;
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'No autorizado' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Solicitud demasiado grande' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  if (err.message === 'Database connection is not configured') {
    return res.status(503).json({ error: 'Base de datos no disponible' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
});

if (require.main === module) {
  app.listen(config.PUERTO, () => {
    console.log(`Servicio de cifrado escuchando en el puerto ${config.PUERTO}`);
  });
}

module.exports = app;
