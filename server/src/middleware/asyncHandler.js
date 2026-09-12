/**
 * Encaminha rejeicoes de handlers async para o middleware de erro.
 * Sem isso, uma promise rejeitada derrubaria a requisicao sem resposta.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
