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
cp .env.example .env      # opcional: só se o backend não estiver em :3000
npm install
npm run dev
```

O Vite sobe em `http://localhost:5173` e faz proxy de `/api` para o endereço em
`BACKEND_URL` (padrão `http://localhost:3000`), espelhando o comportamento do
nginx em produção.

### Rodando com Docker

```bash
cp .env.example .env      # defina ao menos JWT_SECRET
docker compose up --build
```

O front fica em `http://localhost:8080`. O backend **não** tem porta publicada —
é alcançável apenas pela rede interna do compose, como acontece no Coolify.

## Endpoints da API

O front chama sempre `/api/...`; o nginx remove o prefixo antes de repassar ao
backend. As rotas abaixo são as do backend.

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/auth/register` | não | Cria usuário (`name`, `username`, `password`) e devolve token |
| `POST` | `/auth/login` | não | Autentica e devolve token |
| `GET` | `/auth/me` | sim | Dados do usuário logado |
| `GET` | `/tasks?search=&status=` | sim | Lista tarefas, com busca e filtro |
| `POST` | `/tasks` | sim | Cria tarefa |
| `GET` | `/tasks/:id` | sim | Detalhe da tarefa |
| `PUT` | `/tasks/:id` | sim | Atualiza tarefa |
| `DELETE` | `/tasks/:id` | sim | Exclui tarefa |
| `GET` | `/health` | não | Healthcheck |

Erros seguem o formato `{ "error": { "message": "...", "fields": { "campo": "..." } } }`.

### Regras de validação

- **Título** — obrigatório, de 1 a 200 caracteres. Texto só com espaços é rejeitado.
- **Data prevista** — opcional, mas quando enviada precisa ser uma data real no
  formato `AAAA-MM-DD`. Datas inexistentes como `2026-02-31` são recusadas.
- **Status** — `PENDENTE` ou `CONCLUIDA` (padrão `PENDENTE`).
- **Senha** — mínimo de 6 caracteres, armazenada com bcrypt.

## Segurança

- Senhas com bcrypt; o hash nunca sai em nenhuma resposta da API.
- Login com usuário inexistente e com senha errada devolvem a mesma mensagem,
  para não revelar quais usuários existem.
- `helmet` e limite de tentativas (rate limit) nas rotas de autenticação.
- Toda consulta de tarefa filtra pelo usuário do token — um usuário não lê, edita
  nem exclui tarefa de outro.
- O servidor recusa iniciar se `DATABASE_URL` ou `JWT_SECRET` estiverem ausentes:
  não existe segredo padrão embutido no código.
- Nenhum `.env` é versionado; apenas os `.env.example` com valores fictícios.

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
| `BACKEND_URL` | sim em produção | URL **interna** do backend, ex.: `http://backend:3000`. Em dev, padrão `http://localhost:3000` |

`BACKEND_URL` **não** leva o prefixo `VITE_` de propósito: o Vite só embute no
bundle as variáveis prefixadas. Quem a lê é sempre o servidor — o proxy do Vite
em desenvolvimento e o nginx em produção — então a URL do backend nunca chega ao
navegador, e é por isso que ele pode ficar sem URL pública.

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
