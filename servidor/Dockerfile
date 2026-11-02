FROM node:24-trixie-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY *.js ./

FROM gcr.io/distroless/nodejs24-debian13:nonroot
WORKDIR /app
COPY --from=build /app /app
EXPOSE 3000
CMD ["servidor.js"]
