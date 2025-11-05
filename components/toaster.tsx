'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface Toast {
  id: number;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toasts: Toast[];
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastId = 0;

export const Toaster = ({ children }: { children?: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = (toast: Omit<Toast, 'id'>) => {
    toastId += 1;
    setToasts((prev) => [...prev, { ...toast, id: toastId }]);
  };

  const dismiss = (id: number) => setToasts((prev) => prev.filter((toast) => toast.id !== id));

  return (
    <ToastContext.Provider value={{ toasts, pushToast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 flex w-80 flex-col gap-3">
        {toasts.map((toast) => (
          <div key={toast.id} className="rounded-xl bg-slate-900/90 p-4 text-sm text-white shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-white/70">{toast.description}</p>
                ) : null}
              </div>
              <button
                className="text-white/60 transition hover:text-white"
                type="button"
                onClick={() => dismiss(toast.id)}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToaster = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToaster must be used inside Toaster');
  }
  return ctx;
};
