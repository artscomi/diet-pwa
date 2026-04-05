"use client";

import { useEffect } from "react";
import "./AppToast.css";

type AppToastProps = {
  message: string | null;
  onDismiss: () => void;
};

export default function AppToast({ message, onDismiss }: AppToastProps) {
  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(onDismiss, 3200);
    return () => window.clearTimeout(id);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      className="app-toast app-toast--success"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
