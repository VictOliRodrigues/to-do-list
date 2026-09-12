import { TaskItem } from './TaskItem.jsx';

export function TaskList({ tasks, loading, hasFilters, onEdit, onDelete, onAdvanceStatus, busyId }) {
  if (loading) {
    return <div className="empty-state">Carregando tarefas...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        {hasFilters
          ? 'Nenhuma tarefa encontrada para esta pesquisa.'
          : 'Voce ainda nao tem tarefas. Adicione a primeira acima.'}
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdvanceStatus={onAdvanceStatus}
          busy={busyId === task.id}
        />
      ))}
    </ul>
  );
}
