/**
 * Status de tarefa, espelhando o enum TaskStatus do Prisma.
 * A ordem de STATUS_ORDER e a mesma da declaracao no schema, que e a usada
 * pelo servidor para ordenar a listagem.
 */
export const TASK_STATUS = {
  PENDENTE: 'PENDENTE',
  EM_ANDAMENTO: 'EM_ANDAMENTO',
  CONCLUIDA: 'CONCLUIDA',
};

export const STATUS_ORDER = [
  TASK_STATUS.PENDENTE,
  TASK_STATUS.EM_ANDAMENTO,
  TASK_STATUS.CONCLUIDA,
];

/** Rotulo do status no singular, para badges e para o select do formulario. */
export const STATUS_LABELS = {
  [TASK_STATUS.PENDENTE]: 'Pendente',
  [TASK_STATUS.EM_ANDAMENTO]: 'Em andamento',
  [TASK_STATUS.CONCLUIDA]: 'Concluida',
};

/** Rotulo no plural, para o filtro da busca. */
export const STATUS_FILTER_LABELS = {
  [TASK_STATUS.PENDENTE]: 'Pendentes',
  [TASK_STATUS.EM_ANDAMENTO]: 'Em andamento',
  [TASK_STATUS.CONCLUIDA]: 'Concluidas',
};

/** Sufixo da classe CSS da badge (badge-pendente, badge-em-andamento, ...). */
export const STATUS_BADGE_CLASS = {
  [TASK_STATUS.PENDENTE]: 'badge-pendente',
  [TASK_STATUS.EM_ANDAMENTO]: 'badge-em-andamento',
  [TASK_STATUS.CONCLUIDA]: 'badge-concluida',
};

/** Rotulo do botao que avanca o ciclo de status. */
export const NEXT_ACTION_LABELS = {
  [TASK_STATUS.PENDENTE]: 'Iniciar',
  [TASK_STATUS.EM_ANDAMENTO]: 'Concluir',
  [TASK_STATUS.CONCLUIDA]: 'Reabrir',
};

/** Proximo status no ciclo Pendente -> Em andamento -> Concluida -> Pendente. */
export function nextStatus(status) {
  const index = STATUS_ORDER.indexOf(status);
  if (index === -1) return TASK_STATUS.PENDENTE;
  return STATUS_ORDER[(index + 1) % STATUS_ORDER.length];
}
