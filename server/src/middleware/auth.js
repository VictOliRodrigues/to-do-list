import jwt from 'jsonwebtoken';
import { env } from '../env.js';
import { unauthorized } from '../errors.js';

/**
 * Exige um JWT valido no header `Authorization: Bearer <token>` e disponibiliza
 * o id do usuario em `req.userId`. Toda rota de tarefas passa por aqui.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(unauthorized('Token de autenticacao ausente.'));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.userId = payload.sub;
    next();
  } catch {
    next(unauthorized('Token invalido ou expirado.'));
  }
}

/** Assina um token para o usuario informado. */
export function signToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}
