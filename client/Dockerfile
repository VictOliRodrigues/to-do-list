# syntax=docker/dockerfile:1

# ---------- Build do bundle ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- Servidor estatico + proxy ----------
FROM nginx:1.27-alpine AS runner

# envsubst vem no pacote gettext e e usado pelo entrypoint.
RUN apk add --no-cache gettext

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint-custom.sh

# Normaliza quebras de linha (o arquivo pode vir com CRLF do Windows) e torna executavel.
RUN sed -i 's/\r$//' /docker-entrypoint-custom.sh && chmod +x /docker-entrypoint-custom.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint-custom.sh"]
CMD ["nginx", "-g", "daemon off;"]
