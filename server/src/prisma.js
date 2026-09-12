import { PrismaClient } from '@prisma/client';

/**
 * Instancia unica do PrismaClient reaproveitada por toda a aplicacao.
 * Criar um client por requisicao esgotaria o pool de conexoes do MySQL.
 */
export const prisma = new PrismaClient();

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
