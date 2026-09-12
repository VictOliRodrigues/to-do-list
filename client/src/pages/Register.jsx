import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ApiError } from '../api/client.js';

export function Register() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="page-loading">Carregando...</div>;
  if (user) return <Navigate to="/tarefas" replace />;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  /** Validacao local, espelhando as regras do servidor (que segue sendo a fonte da verdade). */
  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'O nome e obrigatorio.';
    if (form.username.trim().length < 3) errors.username = 'O usuario deve ter pelo menos 3 caracteres.';
    if (form.password.length < 6) errors.password = 'A senha deve ter pelo menos 6 caracteres.';
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        username: form.username.trim(),
        password: form.password,
      });
      navigate('/tarefas', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fields || {});
      } else {
        setError('Nao foi possivel concluir o cadastro.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Cadastrar usuario</h1>
        <p className="subtitle">Crie sua conta para gerenciar tarefas.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Nome</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.name)}
              autoComplete="name"
            />
            {fieldErrors.name && <span className="error-text">{fieldErrors.name}</span>}
          </div>

          <div className="field">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.username)}
              autoComplete="username"
            />
            {fieldErrors.username && <span className="error-text">{fieldErrors.username}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.password)}
              autoComplete="new-password"
            />
            {fieldErrors.password && <span className="error-text">{fieldErrors.password}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className="auth-footer">
          Ja tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
