import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Dialogo de confirmacao generico, renderizado fora da arvore da pagina para
 * nao herdar overflow/stacking dos containers. Substitui o window.confirm.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  busyLabel = 'Aguarde...',
  cancelLabel = 'Cancelar',
  variant = 'primary',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);
  // Guarda quem tinha o foco antes de abrir para devolve-lo ao fechar.
  const previousFocusRef = useRef(null);

  // Esc fecha. O listener so existe enquanto o dialogo esta aberto.
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onCancel();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, busy, onCancel]);

  // Trava o scroll do fundo enquanto o dialogo esta aberto.
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Move o foco para o botao de confirmar e o devolve ao fechar.
  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement;
    confirmRef.current?.focus();

    return () => {
      previousFocusRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  // So o clique no proprio overlay fecha; cliques dentro do card sobem ate aqui.
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget && !busy) onCancel();
  };

  return createPortal(
    <div className="modal-overlay" onMouseDown={handleOverlayClick}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-message"
      >
        <h2 className="modal-title" id="modal-title">
          {title}
        </h2>

        <p className="modal-message" id="modal-message">
          {message}
        </p>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>

          <button
            ref={confirmRef}
            type="button"
            className={variant === 'danger' ? 'btn-danger-solid' : 'btn-primary'}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
