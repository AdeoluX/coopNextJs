import React, { useEffect } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  durationMs?: number;
}

export default function Toast({
  message,
  type = "info",
  onClose,
  durationMs = 3000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [onClose, durationMs]);

  const bgClass =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : type === "warning"
      ? "bg-yellow-600"
      : "bg-blue-600";

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      <div
        className={`${bgClass} text-white px-4 py-3 rounded-lg shadow-lg min-w-[260px] max-w-sm flex items-start gap-3`}
      >
        <span className="flex-1 text-sm">{message}</span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-white/80 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
