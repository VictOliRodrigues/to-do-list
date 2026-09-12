#!/bin/sh
set -e

# BACKEND_URL aponta para o endereco interno do backend (ex.: http://backend:3000).
# E lido aqui, pelo nginx - nunca chega ao navegador.
if [ -z "$BACKEND_URL" ]; then
  echo "[entrypoint] ERRO: a variavel BACKEND_URL nao foi definida." >&2
  echo "[entrypoint] Defina, por exemplo, BACKEND_URL=http://backend:3000" >&2
  exit 1
fi

echo "[entrypoint] Proxy /api -> $BACKEND_URL"

# Substitui apenas ${BACKEND_URL}, preservando as variaveis do proprio nginx
# (como $host e $remote_addr).
envsubst '${BACKEND_URL}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec "$@"
