import { createPortal } from 'react-dom';

const ICONS = { success: '✓', error: '⚠' };

/** Pilha de avisos no canto da tela. O estado vive no ToastProvider. */
export function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon" aria-hidden="true">
            {ICONS[toast.type]}
          </span>

          <p className="toast-message">{toast.message}</p>

          <button
            type="button"
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Fechar aviso"
          >
            &times;
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
