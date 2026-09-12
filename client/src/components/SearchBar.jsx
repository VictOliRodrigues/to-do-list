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
        <option value="PENDENTE">Pendentes</option>
        <option value="CONCLUIDA">Concluidas</option>
      </select>

      <button type="button" className="btn-secondary" onClick={onClear} disabled={!hasFilters}>
        Limpar
      </button>
    </div>
  );
}
