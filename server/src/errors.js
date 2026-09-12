/**
 * Erro de aplicacao com status HTTP. Lancado pelas rotas e traduzido para a
 * resposta JSON pelo middleware de erro.
 */
export class AppError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.fields = fields;
  }
}

export const badRequest = (message, fields) => new AppError(400, message, fields);
export const unauthorized = (message = 'Nao autenticado.') => new AppError(401, message);
export const notFound = (message = 'Recurso nao encontrado.') => new AppError(404, message);
export const conflict = (message) => new AppError(409, message);
