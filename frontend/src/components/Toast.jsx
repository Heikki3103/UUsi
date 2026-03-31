import { useEffect } from 'react';
import { CheckIcon, CloseIcon, AlertIcon } from './Icons.jsx';

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 3500);
    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <div className={`toast ${toast.type}`} role="alert">
      {toast.type === 'success' && <CheckIcon />}
      {toast.type === 'error' && <AlertIcon />}
      <span>{toast.message}</span>
    </div>
  );
}
