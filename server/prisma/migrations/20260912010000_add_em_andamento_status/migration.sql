-- AlterTable
-- Novo valor EM_ANDAMENTO no meio do enum, para que a ordenacao por status
-- (orderBy status: 'asc') siga Pendente -> Em andamento -> Concluida.
-- O MySQL guarda o valor pelo indice, mas o MODIFY referencia os valores pelo
-- nome, entao as linhas existentes mantem seu status.
ALTER TABLE `tasks` MODIFY `status` ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA') NOT NULL DEFAULT 'PENDENTE';
