import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ToastContext,
  type ToastType,
  type ToastOptions,
} from "./ToastContext";

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

const DEFAULT_DURATION = 4500;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message: string, optionsOrType?: ToastType | ToastOptions) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      let type: ToastType = "success";
      let durationMs = DEFAULT_DURATION;

      if (typeof optionsOrType === "string") {
        type = optionsOrType;
      } else if (optionsOrType) {
        if (optionsOrType.type) type = optionsOrType.type;
        if (typeof optionsOrType.durationMs === "number") {
          durationMs = optionsOrType.durationMs;
        }
      }

      const id = Date.now();
      setToast({ id, message, type });

      if (durationMs > 0) {
        timerRef.current = setTimeout(() => {
          setToast((current) => (current?.id === id ? null : current));
        }, durationMs);
      }
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-6 sm:top-8 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-lg z-60 pointer-events-none"
        >
          <div
            key={toast.id}
            className={`pointer-events-auto p-3 sm:p-3.5 rounded-2xl border-2 shadow-2xl shadow-black/70 flex items-center justify-between gap-3 animate-toast-in ${
              toast.type === "error"
                ? "bg-rose-50 border-rose-500 text-rose-950 ring-1 ring-rose-950/10"
                : "bg-amber-50 border-yellow-400 text-emerald-950 ring-1 ring-amber-950/10"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {toast.type === "error" ? (
                <div
                  className="flex items-center justify-center size-7 sm:size-8 rounded-full bg-rose-200 border border-rose-400 text-rose-900 text-sm font-bold shadow-xs shrink-0"
                  aria-hidden="true"
                >
                  ⚠️
                </div>
              ) : (
                <div
                  className="flex items-center justify-center size-7 sm:size-8 rounded-full bg-yellow-400 border border-yellow-500/80 text-emerald-950 font-black text-sm shadow-xs shrink-0"
                  aria-hidden="true"
                >
                  ✓
                </div>
              )}
              <span className="font-bold text-sm sm:text-base leading-snug break-words">
                {toast.message}
              </span>
            </div>

            <button
              type="button"
              onClick={hideToast}
              aria-label="Dismiss notification"
              className={`text-xs sm:text-sm font-bold px-2 py-1 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 ${
                toast.type === "error"
                  ? "text-rose-800/80 hover:text-rose-950 hover:bg-rose-200/60 focus-visible:ring-rose-800"
                  : "text-emerald-900/70 hover:text-emerald-950 hover:bg-amber-200/60 focus-visible:ring-emerald-800"
              }`}
            >
              ✕
            </button>
          </div>
        </aside>
      )}
    </ToastContext.Provider>
  );
};
