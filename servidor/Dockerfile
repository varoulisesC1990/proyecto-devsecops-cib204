# ============================================================================
#  Dockerfile  -  Servicio de cifrado
#  >>> VERSION INSEGURA (rama inseguro) <<<
#  Contiene malas practicas INTENCIONADAS que Trivy debe reportar.
# ============================================================================

# [VULN-11] Imagen base "latest" (no reproducible) y pesada, con muchos
#   paquetes de sistema vulnerables. La solucion es una etiqueta fija y una
#   imagen slim (p.ej. node:20-slim).  CWE-1104 / mala practica de imagen.
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY *.js ./

FROM node:24-bookworm-slim
WORKDIR /app
RUN apt-get update \
    && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system appuser \
    && useradd --system --gid appuser --no-create-home appuser
COPY --from=build --chown=appuser:appuser /app /app
USER appuser
EXPOSE 3000
CMD ["node", "servidor.js"]

# [VULN-12] Se copia TODO el contexto (incluye .env, llaves y node_modules).
#   Puede filtrar secretos dentro de la imagen.  CWE-538
##COPY . .

# Instala dependencias en la imagen (sin fijar el lockfile con npm ci).
##RUN npm install

##EXPOSE 3000

# El contenedor corre con el usuario no privilegiado node.
#USER node

#CMD ["node", "servidor.js"]
