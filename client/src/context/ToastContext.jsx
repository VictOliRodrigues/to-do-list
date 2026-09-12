import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ToastContainer } from '../components/ToastContainer.jsx';

const ToastContext = createContext(null);

const DURATION = { success: 4000, error: 6000 };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextIdRef = useRef(1);
  // id -> timeoutId, para cancelar o auto-dismiss ao fechar na mao ou desmontar.
  const timersRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (type, message) => {
      if (!message) return;

      const id = nextIdRef.current++;
      setToasts((current) => [...current, { id, type, message }]);

      const timer = setTimeout(() => dismiss(id), DURATION[type]);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  const showSuccess = useCallback((message) => show('success', message), [show]);
  const showError = useCallback((message) => show('error', message), [show]);

  // Sem isso o StrictMode e a navegacao deixariam timers orfaos.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ showSuccess, showError, dismiss }),
    [showSuccess, showError, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast precisa estar dentro de ToastProvider.');
  return context;
}
