const { expressjwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const config = require('./config');

const jwksUri = `${config.KEYCLOAK_URL}/realms/${encodeURIComponent(config.KEYCLOAK_REALM)}/protocol/openid-connect/certs`;

const requiereAuth = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri,
  }),
  issuer: config.KEYCLOAK_ISSUER,
  algorithms: ['RS256'],
});

module.exports = { requiereAuth };
