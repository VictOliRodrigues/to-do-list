/**
 * Le e valida as variaveis de ambiente no boot.
 * Falha cedo e de forma ruidosa se algo essencial estiver faltando, para nunca
 * subir a aplicacao com um segredo vazio ou um banco inacessivel.
 */

const required = ['DATABASE_URL', 'JWT_SECRET'];

const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  console.error(
    `[env] Variaveis de ambiente obrigatorias ausentes: ${missing.join(', ')}.\n` +
      '[env] Defina-as no .env (local) ou nas variaveis da aplicacao (Coolify).'
  );
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 16) {
  console.error('[env] JWT_SECRET muito curto. Use pelo menos 16 caracteres.');
  process.exit(1);
}

export const env = {
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  get isProduction() {
    return this.nodeEnv === 'production';
  },
};
