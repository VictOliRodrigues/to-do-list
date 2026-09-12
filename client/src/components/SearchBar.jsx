import { STATUS_FILTER_LABELS, STATUS_ORDER } from '../constants/taskStatus.js';

/** Busca por texto e filtro por status. O estado vive na pagina de tarefas. */
export function SearchBar({ search, status, onSearchChange, onStatusChange, onClear }) {
  const hasFilters = Boolean(search) || Boolean(status);

  return (
    <div className="search-bar">
      <input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Pesquisar por titulo ou descricao..."
        aria-label="Pesquisar tarefas"
      />

      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        aria-label="Filtrar por status"
      >
        <option value="">Todos os status</option>
        {STATUS_ORDER.map((value) => (
          <option key={value} value={value}>
            {STATUS_FILTER_LABELS[value]}
          </option>
        ))}
      </select>

      <button type="button" className="btn-secondary" onClick={onClear} disabled={!hasFilters}>
        Limpar
      </button>
    </div>
  );
}
