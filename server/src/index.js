import { env } from './env.js';
import { createApp } from './app.js';
import { disconnectPrisma } from './prisma.js';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`[server] Escutando na porta ${env.port} (${env.nodeEnv})`);
});

/** Encerra conexoes abertas antes de sair, para o deploy nao cortar requisicoes no meio. */
async function shutdown(signal) {
  console.log(`[server] ${signal} recebido, encerrando...`);
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
