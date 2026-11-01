const crypto = require('crypto');
const http = require('http');
const jwt = require('jsonwebtoken');
const request = require('supertest');

const keyPair = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});
const publicJwk = {
  ...crypto.createPublicKey(keyPair.publicKey).export({ format: 'jwk' }),
  kid: 'integration-test',
  use: 'sig',
  alg: 'RS256',
};

let app;
let jwksServer;
let token;
let issuer;

beforeAll(async () => {
  // The fake JWKS endpoint is bound to an ephemeral loopback port for tests only.
  jwksServer = http.createServer((req, res) => { // nosemgrep: problem-based-packs.insecure-transport.js-node.using-http-server.using-http-server
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ keys: [publicJwk] }));
  });
  await new Promise((resolve) => jwksServer.listen(0, '127.0.0.1', resolve));

  const { port } = jwksServer.address();
  process.env.KEYCLOAK_URL = `http://127.0.0.1:${port}`;
  process.env.KEYCLOAK_REALM = 'test';

  issuer = `${process.env.KEYCLOAK_URL}/realms/test`;
  app = require('./servidor');
  token = jwt.sign({ sub: 'integration-test' }, keyPair.privateKey, {
    algorithm: 'RS256',
    keyid: publicJwk.kid,
    issuer,
  });
});

afterAll(async () => {
  await new Promise((resolve, reject) => {
    jwksServer.close((err) => (err ? reject(err) : resolve()));
  });
});

describe('API del servicio de cifrado', () => {
  test('GET /salud responde estado ok', async () => {
    const res = await request(app).get('/salud');
    expect(res.statusCode).toBe(200);
    expect(res.body.estado).toBe('ok');
  });

  test('GET /llave entrega la llave publica', async () => {
    const res = await request(app).get('/llave');
    expect(res.statusCode).toBe(200);
    expect(res.body.llavePublica).toContain('BEGIN PUBLIC KEY');
  });

  test('rechaza solicitudes protegidas sin token', async () => {
    const res = await request(app).post('/cifrar').send({ texto: 'prueba' });
    expect(res.statusCode).toBe(401);
  });

  test('ciclo completo: /cifrar y luego /descifrar recupera el texto', async () => {
    const texto = 'Prueba de integracion';
    const c = await request(app)
      .post('/cifrar')
      .set('Authorization', `Bearer ${token}`)
      .send({ texto });
    expect(c.statusCode).toBe(200);
    expect(c.body.cifrado).toBeDefined();

    const d = await request(app)
      .post('/descifrar')
      .set('Authorization', `Bearer ${token}`)
      .send({ cifrado: c.body.cifrado });
    expect(d.statusCode).toBe(200);
    expect(d.body.descifrado).toBe(texto);
  });
});
