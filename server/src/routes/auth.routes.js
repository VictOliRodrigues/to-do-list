import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { conflict, unauthorized } from '../errors.js';

const router = Router();

// Campos devolvidos ao cliente. O passwordHash NUNCA entra nesta lista.
const publicUserFields = { id: true, name: true, username: true, createdAt: true };

const BCRYPT_ROUNDS = 10;

/** Limita tentativas por IP, dificultando forca bruta de senha. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Muitas tentativas. Tente novamente em alguns minutos.' } },
});

const registerSchema = z.object({
  name: z
    .string({ required_error: 'O nome e obrigatorio.' })
    .trim()
    .min(1, 'O nome e obrigatorio.')
    .max(120, 'O nome deve ter no maximo 120 caracteres.'),
  username: z
    .string({ required_error: 'O usuario e obrigatorio.' })
    .trim()
    .min(3, 'O usuario deve ter pelo menos 3 caracteres.')
    .max(60, 'O usuario deve ter no maximo 60 caracteres.')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Use apenas letras, numeros, ponto, hifen ou underscore.'),
  password: z
    .string({ required_error: 'A senha e obrigatoria.' })
    .min(6, 'A senha deve ter pelo menos 6 caracteres.')
    .max(72, 'A senha deve ter no maximo 72 caracteres.'),
});

const loginSchema = z.object({
  username: z.string({ required_error: 'O usuario e obrigatorio.' }).trim().min(1, 'O usuario e obrigatorio.'),
  password: z.string({ required_error: 'A senha e obrigatoria.' }).min(1, 'A senha e obrigatoria.'),
});

router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { name, username, password } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (existing) {
      throw conflict('Este usuario ja esta em uso.');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: { name, username, passwordHash },
      select: publicUserFields,
    });

    res.status(201).json({ user, token: signToken(user.id) });
  })
);

router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { username, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { username } });

    // Mensagem identica para usuario inexistente e senha errada: nao revela
    // quais usuarios existem na base.
    const invalid = unauthorized('Usuario ou senha invalidos.');
    if (!user) {
      // Gasta o mesmo tempo de um bcrypt real para nao vazar a existencia do
      // usuario pelo tempo de resposta.
      await bcrypt.compare(password, '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv');
      throw invalid;
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw invalid;
    }

    res.json({
      user: { id: user.id, name: user.name, username: user.username, createdAt: user.createdAt },
      token: signToken(user.id),
    });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: publicUserFields,
    });

    if (!user) {
      throw unauthorized('Usuario nao encontrado.');
    }

    res.json({ user });
  })
);

export default router;
