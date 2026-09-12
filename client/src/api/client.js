/**
 * Wrapper de fetch para a API.
 *
 * A base e sempre o caminho relativo /api: em producao o nginx do proprio
 * container faz proxy para a URL interna do backend, e em dev o Vite faz o
 * mesmo. O navegador nunca conhece o endereco real do backend.
 */

const BASE_URL = '/api';

const TOKEN_KEY = 'todo:token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/** Erro vindo da API, carregando status e erros por campo. */
export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields || {};
  }
}

/** Chamado quando a API devolve 401, para o app derrubar a sessao. */
let onUnauthorized = () => {};
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = tokenStorage.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Nao foi possivel conectar ao servidor.');
  }

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    // Token expirado ou invalido: encerra a sessao e manda para o login.
    if (response.status === 401 && auth) onUnauthorized();

    const error = payload?.error ?? {};
    throw new ApiError(response.status, error.message || 'Erro inesperado.', error.fields);
  }

  return payload;
}

export const api = {
  register: (data) => request('/auth/register', { method: 'POST', body: data, auth: false }),
  login: (data) => request('/auth/login', { method: 'POST', body: data, auth: false }),
  me: () => request('/auth/me'),

  listTasks: ({ search, status } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    const query = params.toString();
    return request(`/tasks${query ? `?${query}` : ''}`);
  },
  createTask: (data) => request('/tasks', { method: 'POST', body: data }),
  updateTask: (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: data }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
