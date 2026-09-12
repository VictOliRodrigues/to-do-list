import { ZodError } from 'zod';
import { AppError } from '../errors.js';
import { env } from '../env.js';

/** Rota inexistente. */
export function notFoundHandler(req, res) {
  res.status(404).json({ error: { message: 'Rota nao encontrada.' } });
}

/**
 * Handler central de erros. Toda resposta de erro sai no formato
 * `{ error: { message, fields? } }`, onde `fields` mapeia campo -> mensagem.
 */
// eslint-disable-next-line no-unused-vars -- o Express so reconhece o handler com 4 argumentos
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    const fields = {};
    for (const issue of err.errors) {
      const path = issue.path.join('.') || '_';
      if (!fields[path]) fields[path] = issue.message;
    }
    return res.status(400).json({
      error: { message: 'Dados invalidos.', fields },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { message: err.message, ...(err.fields && { fields: err.fields }) },
    });
  }

  // JSON malformado no corpo da requisicao
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: { message: 'JSON invalido no corpo da requisicao.' } });
  }

  // Erro inesperado: loga apenas a mensagem e o stack, nunca o corpo da
  // requisicao (evita registrar senhas em texto claro).
  console.error('[erro]', err.message, env.isProduction ? '' : err.stack);

  res.status(500).json({ error: { message: 'Erro interno no servidor.' } });
}
