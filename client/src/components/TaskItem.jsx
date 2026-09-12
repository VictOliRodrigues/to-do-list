/** Formata AAAA-MM-DD (ou ISO) para DD/MM/AAAA sem deslocar o dia por fuso. */
function formatDate(isoDate) {
  if (!isoDate) return null;
  const [year, month, day] = isoDate.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

/** Uma tarefa pendente com data anterior a hoje esta atrasada. */
function isOverdue(task) {
  if (!task.dueDate || task.status === 'CONCLUIDA') return false;
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;
  return task.dueDate.slice(0, 10) < todayIso;
}

export function TaskItem({ task, onEdit, onDelete, onToggleStatus, busy }) {
  const concluida = task.status === 'CONCLUIDA';
  const atrasada = isOverdue(task);
  const dueDate = formatDate(task.dueDate);

  return (
    <li className={`task-item ${concluida ? 'concluida' : ''}`}>
      <div>
        <h3 className="task-title">{task.title}</h3>

        {task.description && <p className="task-description">{task.description}</p>}

        <div className="task-meta">
          <span className={`badge ${concluida ? 'badge-concluida' : 'badge-pendente'}`}>
            {concluida ? 'Concluida' : 'Pendente'}
          </span>

          {dueDate && <span>Prevista para {dueDate}</span>}

          {atrasada && <span className="badge badge-atrasada">Atrasada</span>}
        </div>
      </div>

      <div className="task-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onToggleStatus(task)}
          disabled={busy}
          title={concluida ? 'Marcar como pendente' : 'Marcar como concluida'}
        >
          {concluida ? 'Reabrir' : 'Concluir'}
        </button>

        <button type="button" className="btn-secondary" onClick={() => onEdit(task)} disabled={busy}>
          Editar
        </button>

        <button type="button" className="btn-danger" onClick={() => onDelete(task)} disabled={busy}>
          Excluir
        </button>
      </div>
    </li>
  );
}
