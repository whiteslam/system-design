"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-border bg-card text-foreground shadow-xl",
        },
      }}
      theme="dark"
    />
  );
}
