import { createContext, useContext } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  type?: ToastType;
  durationMs?: number;
}

export interface ToastContextValue {
  showToast: (
    message: string,
    optionsOrType?: ToastType | ToastOptions,
  ) => void;
  hideToast: () => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined,
);

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
