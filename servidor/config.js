// ============================================================================
//  config.js  -  Configuracion del servicio
//  >>> VERSION INSEGURA <<<  Contiene secretos quemados a proposito.
// ============================================================================

// Las credenciales de nube se leen del entorno y no deben versionarse.

const config = {
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,

  JWT_SECRET: process.env.JWT_SECRET, 
  DATABASE_URL: process.env.DATABASE_URL,

  // Control de acceso DESACTIVADO por defecto (mal)
  AUTH_ENABLED: process.env.AUTH_ENABLED === 'true' ? true : false,

  // Parametros de Keycloak (IAM)
  KEYCLOAK_URL: process.env.KEYCLOAK_URL || 'http://localhost:8080',
  KEYCLOAK_REALM: process.env.KEYCLOAK_REALM || 'appmovil',

  PUERTO: process.env.PORT || 3000,
};

module.exports = config;
