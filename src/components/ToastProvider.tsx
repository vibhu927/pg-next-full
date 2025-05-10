"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        },
        success: {
          style: {
            borderLeft: "4px solid var(--success)",
          },
        },
        error: {
          style: {
            borderLeft: "4px solid var(--destructive)",
          },
        },
      }}
    />
  );
}
