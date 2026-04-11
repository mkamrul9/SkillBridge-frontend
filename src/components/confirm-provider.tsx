"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
};

type ConfirmContextType = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const closeModal = useCallback((value: boolean) => {
    setIsOpen(false);
    if (resolver) resolver(value);
    setResolver(null);
  }, [resolver]);

  const confirm = useCallback((nextOptions: ConfirmOptions) => {
    setOptions(nextOptions);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/65 px-4">
          <div className="w-full max-w-md rounded-xl border border-border/80 bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground">{options.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{options.message}</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => closeModal(false)}>
                {options.cancelText || "Cancel"}
              </Button>
              <Button
                variant={options.variant === "destructive" ? "destructive" : "default"}
                onClick={() => closeModal(true)}
              >
                {options.confirmText || "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used inside ConfirmProvider");
  }
  return context;
}
