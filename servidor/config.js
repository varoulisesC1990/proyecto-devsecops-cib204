// ============================================================================
//  config.js  -  Configuracion del servicio
//  La configuración sensible se obtiene del entorno.
// ============================================================================

// Las credenciales de nube se leen del entorno y no deben versionarse.

const keycloakUrl = (process.env.KEYCLOAK_URL || 'http://localhost:8080').replace(/\/$/, '');
const keycloakRealm = process.env.KEYCLOAK_REALM || 'appmovil';

const config = {
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,

  DATABASE_URL: process.env.DATABASE_URL,
  CORS_ORIGINS: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  KEYCLOAK_URL: keycloakUrl,
  KEYCLOAK_REALM: keycloakRealm,
  KEYCLOAK_ISSUER: (process.env.KEYCLOAK_ISSUER
    || `${keycloakUrl}/realms/${keycloakRealm}`).replace(/\/$/, ''),

  PUERTO: process.env.PORT || 3000,
};

module.exports = config;
