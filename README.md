# To-Do List

Gerenciador de tarefas full-stack com autenticação por usuário e senha.

- **Front-end:** React 19 + Vite + React Router
- **Back-end:** Node.js + Express 5 + Prisma
- **Banco:** MySQL 8
- **Deploy:** Coolify, duas aplicações separadas (Dockerfile como BuildPack)

## Funcionalidades

- Cadastro de usuário e login (JWT + bcrypt)
- Adicionar, listar, editar e excluir tarefas
- Pesquisar tarefas por título e descrição, com filtro por status
- Campos da tarefa: título, descrição, data prevista (date picker) e status
- Cada usuário enxerga apenas as próprias tarefas

## Estrutura

```
to-do-list/
├─ server/    API Node.js + Prisma  (app "backend" no Coolify)
└─ client/    SPA React + nginx     (app "frontend" no Coolify)
```

## Desenvolvimento local

### Pré-requisitos

Node.js 20+ e um MySQL 8 acessível. Para subir tudo junto via Docker, veja
[Rodando com Docker](#rodando-com-docker).

### Back-end

```bash
cd server
cp .env.example .env      # preencha DATABASE_URL e JWT_SECRET
npm install
npx prisma migrate dev
npm run dev
```

A API sobe em `http://localhost:3000`. Confira com:

```bash
curl http://localhost:3000/health
```

### Front-end

```bash
cd client
npm install
npm run dev
```

O Vite sobe em `http://localhost:5173` e faz proxy de `/api` para
`http://localhost:3000`, espelhando o comportamento do nginx em produção.

### Rodando com Docker

```bash
docker compose up --build
```

O front fica em `http://localhost:8080`. O backend **não** tem porta publicada —
é alcançável apenas pela rede interna do compose, como acontece no Coolify.

## Variáveis de ambiente

Nenhum valor real de credencial está versionado. Os arquivos `.env` são ignorados
pelo git; use os `.env.example` como referência.

### server

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | sim | String de conexão MySQL (`mysql://usuario:senha@host:3306/todolist`) |
| `JWT_SECRET` | sim | Segredo para assinar os tokens. Gere com `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | não | Validade do token (padrão `7d`) |
| `PORT` | não | Porta HTTP (padrão `3000`) |
| `NODE_ENV` | não | `development` ou `production` |

O servidor aborta no boot se `DATABASE_URL` ou `JWT_SECRET` estiverem ausentes.

### client

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `BACKEND_URL` | sim | URL **interna** do backend, ex.: `http://backend:3000`. Lida pelo nginx, nunca pelo navegador |

## Deploy no Coolify

Crie **duas aplicações** apontando para este mesmo repositório.

### 1. Aplicação `backend`

- Build Pack: **Dockerfile**
- Base Directory: `/server`
- Domínio público: **nenhum** (deixe em branco)
- Porta exposta: `3000`
- Variáveis: `DATABASE_URL`, `JWT_SECRET`, `PORT=3000`, `NODE_ENV=production`

As migrations do Prisma são aplicadas automaticamente a cada deploy
(`prisma migrate deploy`).

### 2. Aplicação `frontend`

- Build Pack: **Dockerfile**
- Base Directory: `/client`
- Domínio público: o domínio da aplicação
- Porta exposta: `80`
- Variáveis: `BACKEND_URL=http://<nome-interno-do-backend>:3000`

> Use o nome interno que o Coolify dá ao container do backend. As duas aplicações
> precisam estar no mesmo projeto/rede para se enxergarem.

### Por que o backend não precisa de URL pública

O navegador nunca fala com o backend diretamente. O container do front serve o
bundle React por nginx e faz `proxy_pass` de `/api` para a URL interna do backend.
Como todas as chamadas saem da mesma origem, não há CORS e a URL do backend nunca
é exposta ao cliente.

```
navegador ──► frontend (nginx) ──► backend (rede interna) ──► MySQL
              público              sem URL pública
```

### Banco de dados

Crie um MySQL no próprio Coolify (ou use um externo) e aponte a `DATABASE_URL`
do backend para ele usando o hostname interno.
