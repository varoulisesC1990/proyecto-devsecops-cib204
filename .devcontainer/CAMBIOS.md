# Cambios en devcontainer.json

## Actualización: 19 septiembre 2026

### Problema identificado
El `devcontainer.json` original usaba `docker-in-docker:2`, que genera error de recuperación en Codespace:
```
This codespace is currently running in recovery mode due to a container error
```

**Causa raíz:** La imagen `javascript-node:20` ahora corre en Debian 13 (trixie), donde el paquete `moby-cli` no está disponible. La característica `docker-in-docker:2` intenta instalarlo por defecto → falla la inicialización del Codespace.

### Configuración anterior
```json
"features": {
  "ghcr.io/devcontainers/features/docker-in-docker:2": {}
}
```

### Configuración actual
```json
"features": {
  "ghcr.io/devcontainers/features/docker-outside-of-docker:1": {
    "moby": false
  }
}
```

### Por qué se cambió
- **`docker-outside-of-docker`** en lugar de `docker-in-docker`: Accede al daemon de Docker del host sin intentar instalarlo dentro del contenedor.
- **`"moby": false`**: Desactiva la instalación de moby-cli, que no existe en Debian trixie.
- Resultado: Codespace inicia correctamente con Node 20 + acceso a Docker (cuando se ejecuta localmente o en entornos que lo soporten).

### Impacto
- ✅ El Codespace ya no entra en recovery mode
- ✅ `docker compose up` (Keycloak, laboratorio §6.2 y §7) funciona en entornos locales
- ✅ Las pruebas en GitHub Actions no se ven afectadas

### Validación
Verifica que el Codespace inicia correctamente y ejecuta:
```bash
node --version      # Debe ser v20.x.x
npm --version       # Debe funcionar
docker --version    # Debe estar disponible
```
