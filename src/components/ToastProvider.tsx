import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/src/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────
export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (options: string | { title?: string; description: string; variant?: ToastType }) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: string | { title?: string; description: string; variant?: ToastType }) => {
    const id = Math.random().toString(36).slice(2);
    let message: string;
    let type: ToastType = "info";

    if (typeof options === "string") {
      message = options;
    } else {
      message = options.description;
      if (options.title) message = `${options.title}: ${message}`;
      if (options.variant) type = options.variant;
    }

    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-xl max-w-sm",
                t.type === "success" && "bg-emerald-50/95 border-emerald-200 text-emerald-900",
                t.type === "error"   && "bg-rose-50/95 border-rose-200 text-rose-900",
                t.type === "info"    && "bg-white/95 border-teal-100 text-teal-900",
              )}
            >
              <div className="shrink-0 mt-0.5">
                {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {t.type === "error"   && <AlertCircle className="w-4 h-4 text-rose-500" />}
                {t.type === "info"    && <Info className="w-4 h-4 text-teal-500" />}
              </div>
              <p className="text-xs font-bold leading-relaxed flex-1">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 p-0.5 hover:opacity-60 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
