# syntax=docker/dockerfile:1

# ---------- Dependencias de producao ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

# ---------- Imagem final ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Necessario para o engine do Prisma em imagens Alpine.
RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY prisma ./prisma
COPY src ./src

# Roda como usuario sem privilegios (a imagem node ja traz o usuario "node").
USER node

EXPOSE 3000

# Aplica as migrations pendentes antes de subir. E idempotente: em um deploy sem
# migrations novas, nao faz nada.
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
