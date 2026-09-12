import { useEffect, useState } from 'react';
import { STATUS_LABELS, STATUS_ORDER, TASK_STATUS } from '../constants/taskStatus.js';

const EMPTY = { title: '', description: '', dueDate: '', status: TASK_STATUS.PENDENTE };

/**
 * Formulario de criacao e edicao. Quando `task` vem preenchida, opera em modo
 * de edicao; caso contrario, cria uma nova tarefa.
 */
export function TaskForm({ task, onSubmit, onCancel, submitting }) {
  const isEditing = Boolean(task);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title ?? '',
        description: task.description ?? '',
        // A API devolve ISO completo; o input[type=date] espera AAAA-MM-DD.
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        status: task.status ?? TASK_STATUS.PENDENTE,
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [task]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  /** Espelha as regras do servidor: titulo obrigatorio e data valida. */
  const validate = () => {
    const found = {};

    if (!form.title.trim()) {
      found.title = 'O titulo e obrigatorio.';
    } else if (form.title.trim().length > 200) {
      found.title = 'O titulo deve ter no maximo 200 caracteres.';
    }

    if (form.dueDate) {
      const parsed = new Date(`${form.dueDate}T00:00:00.000Z`);
      if (Number.isNaN(parsed.getTime()) || !parsed.toISOString().startsWith(form.dueDate)) {
        found.dueDate = 'A data prevista nao e uma data valida.';
      }
    }

    return found;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim() || null,
        dueDate: form.dueDate || null,
        status: form.status,
      });
      if (!isEditing) setForm(EMPTY);
    } catch (err) {
      // Erros por campo vindos da API (ex.: data invalida que passou no front).
      setErrors(err?.fields || {});
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="title">Titulo *</label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          aria-invalid={Boolean(errors.title)}
          maxLength={200}
          placeholder="Ex.: Enviar relatorio mensal"
        />
        {errors.title && <span className="error-text">{errors.title}</span>}
      </div>

      <div className="field">
        <label htmlFor="description">Descricao</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          aria-invalid={Boolean(errors.description)}
          placeholder="Detalhes da tarefa (opcional)"
        />
        {errors.description && <span className="error-text">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="dueDate">Data prevista</label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
            aria-invalid={Boolean(errors.dueDate)}
          />
          {errors.dueDate && <span className="error-text">{errors.dueDate}</span>}
        </div>

        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={form.status} onChange={handleChange}>
            {STATUS_ORDER.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-actions">
        {isEditing && (
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Salvando...' : isEditing ? 'Salvar alteracoes' : 'Adicionar tarefa'}
        </button>
      </div>
    </form>
  );
}
