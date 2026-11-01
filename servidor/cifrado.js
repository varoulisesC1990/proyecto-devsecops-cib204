// ============================================================================
//  cifrado.js  -  Modulo de cifrado RSA
//  CIB-204 Seguridad del Software - Universidad Cenfotec
//
//  Cifrado RSA-OAEP con una llave de 2048 bits.
// ============================================================================

const crypto = require('crypto');

const TAMANO_LLAVE = 2048;
const RELLENO = crypto.constants.RSA_PKCS1_OAEP_PADDING;
const HASH_OAEP = 'sha256';

function generarLlaves() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: TAMANO_LLAVE,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
}

function cifrar(textoPlano, llavePublica) {
  const buffer = Buffer.from(String(textoPlano), 'utf8');
  const cifrado = crypto.publicEncrypt(
    { key: llavePublica, padding: RELLENO, oaepHash: HASH_OAEP },
    buffer
  );
  return cifrado.toString('base64');
}

function descifrar(textoCifradoBase64, llavePrivada) {
  const buffer = Buffer.from(String(textoCifradoBase64), 'base64');
  const descifrado = crypto.privateDecrypt(
    { key: llavePrivada, padding: RELLENO, oaepHash: HASH_OAEP },
    buffer
  );
  return descifrado.toString('utf8');
}

module.exports = { generarLlaves, cifrar, descifrar, TAMANO_LLAVE };
