import { createPortal } from 'react-dom';
import { useToast } from '../hooks/useToast';
import type { ToastType } from '../hooks/useToast';

const iconMap: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
};

const colorMap: Record<ToastType, string> = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-[420px] animate-[slideInRight_0.3s_ease-out] ${colorMap[toast.type]}`}
        >
          <span className="material-symbols-outlined text-xl shrink-0">
            {iconMap[toast.type]}
          </span>
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
