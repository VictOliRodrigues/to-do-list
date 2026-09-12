import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { TaskForm } from '../components/TaskForm.jsx';
import { TaskList } from '../components/TaskList.jsx';
import { SearchBar } from '../components/SearchBar.jsx';

export function Tasks() {
  const { user, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const formPanelRef = useRef(null);

  const loadTasks = useCallback(async (filters) => {
    setLoading(true);
    setError('');
    try {
      const { tasks: found } = await api.listTasks(filters);
      setTasks(found);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return; // sessao ja encerrada
      setError(err instanceof ApiError ? err.message : 'Nao foi possivel carregar as tarefas.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Recarrega ao mudar busca ou status. O debounce evita uma requisicao por tecla.
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTasks({ search: search.trim(), status });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, status, loadTasks]);

  const refresh = () => loadTasks({ search: search.trim(), status });

  const handleCreate = async (data) => {
    setSubmitting(true);
    setError('');
    try {
      await api.createTask(data);
      await refresh();
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length === 0) {
        setError(err.message);
      }
      throw err; // o TaskForm exibe os erros por campo
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data) => {
    setSubmitting(true);
    setError('');
    try {
      await api.updateTask(editingTask.id, data);
      setEditingTask(null);
      await refresh();
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length === 0) {
        setError(err.message);
      }
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Excluir a tarefa "${task.title}"?`)) return;

    setBusyId(task.id);
    setError('');
    try {
      await api.deleteTask(task.id);
      if (editingTask?.id === task.id) setEditingTask(null);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Nao foi possivel excluir a tarefa.');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleStatus = async (task) => {
    setBusyId(task.id);
    setError('');
    try {
      await api.updateTask(task.id, {
        status: task.status === 'CONCLUIDA' ? 'PENDENTE' : 'CONCLUIDA',
      });
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Nao foi possivel atualizar o status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
  };

  return (
    <>
      <header className="app-header">
        <div className="inner">
          <h1>Minhas tarefas</h1>
          <div className="user-info">
            <span>{user?.name}</span>
            <button type="button" className="btn-secondary" onClick={logout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {error && <div className="alert alert-error">{error}</div>}

        <section className="panel" ref={formPanelRef}>
          <h2>{editingTask ? 'Editar tarefa' : 'Nova tarefa'}</h2>
          <TaskForm
            key={editingTask?.id ?? 'new'}
            task={editingTask}
            onSubmit={editingTask ? handleUpdate : handleCreate}
            onCancel={() => setEditingTask(null)}
            submitting={submitting}
          />
        </section>

        <section className="panel">
          <SearchBar
            search={search}
            status={status}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onClear={handleClearFilters}
          />
        </section>

        <TaskList
          tasks={tasks}
          loading={loading}
          hasFilters={Boolean(search.trim() || status)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          busyId={busyId}
        />
      </main>
    </>
  );
}
