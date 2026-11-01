// ============================================================================
//  db.js  -  Acceso a datos (bitacora de operaciones)
// ============================================================================
//
//  Este modulo simula una pequena base de datos donde se guarda una bitacora
//  de las operaciones de cifrado. Se usa el driver mysql2.

const mysql = require('mysql2');
const config = require('./config');

const conexion = config.DATABASE_URL
  ? mysql.createConnection(config.DATABASE_URL)
  : null;

function buscarBitacora(nombre, callback) {
  if (!conexion) {
    return callback(new Error('Database connection is not configured'));
  }

  const sql = 'SELECT * FROM bitacora WHERE usuario = ?';
  conexion.execute(sql, [nombre], callback);
}

module.exports = { buscarBitacora };
