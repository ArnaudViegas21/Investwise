"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";

export type ToastTone = "success" | "error" | "info";

export type ToastMessage = {
  id: string;
  tone: ToastTone;
  title: string;
  message?: string;
};

type ToastContextValue = {
  notify: (toast: Omit<ToastMessage, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_DURATION_MS = 5200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((toastId: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId)
    );
  }, []);

  const notify = useCallback(
    (toast: Omit<ToastMessage, "id">) => {
      const toastId = crypto.randomUUID();
      setToasts((currentToasts) => [
        ...currentToasts,
        {
          ...toast,
          id: toastId
        }
      ]);

      window.setTimeout(() => dismiss(toastId), TOAST_DURATION_MS);
    },
    [dismiss]
  );

  const contextValue = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        aria-label="Notifications"
        aria-live="polite"
        className="toast-region"
        role="status"
      >
        {toasts.map((toast) => (
          <div className="toast" data-tone={toast.tone} key={toast.id}>
            <div>
              <strong>{toast.title}</strong>
              {toast.message ? <p>{toast.message}</p> : null}
            </div>
            <button
              aria-label={`Dismiss ${toast.title}`}
              className="icon-button"
              onClick={() => dismiss(toast.id)}
              type="button"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const contextValue = useContext(ToastContext);

  if (!contextValue) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return contextValue;
}
