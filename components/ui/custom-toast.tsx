'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  X,
  LogOut,
  HelpCircle,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

export interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

// Global Event Emitters for usage anywhere
const TOAST_EVENT = 'posyandu_custom_toast';
const CONFIRM_EVENT = 'posyandu_custom_confirm';

export const toast = {
  success(title: string, description?: string, duration = 4000) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(TOAST_EVENT, {
          detail: { type: 'success', title, description, duration },
        })
      );
    }
  },
  error(title: string, description?: string, duration = 5000) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(TOAST_EVENT, {
          detail: { type: 'error', title, description, duration },
        })
      );
    }
  },
  info(title: string, description?: string, duration = 4000) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(TOAST_EVENT, {
          detail: { type: 'info', title, description, duration },
        })
      );
    }
  },
  warning(title: string, description?: string, duration = 4500) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(TOAST_EVENT, {
          detail: { type: 'warning', title, description, duration },
        })
      );
    }
  },
  confirm(options: ConfirmDialogOptions) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CONFIRM_EVENT, { detail: options }));
    }
  },
};

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  // Listen to toast and confirm events
  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        type: ToastType;
        title: string;
        description?: string;
        duration?: number;
      }>;
      const { type, title, description, duration = 4000 } = customEvent.detail;
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      setToasts((prev) => [...prev, { id, type, title, description, duration }]);
    };

    const handleConfirmEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ConfirmDialogOptions>;
      setConfirmDialog(customEvent.detail);
    };

    window.addEventListener(TOAST_EVENT, handleToastEvent);
    window.addEventListener(CONFIRM_EVENT, handleConfirmEvent);

    return () => {
      window.removeEventListener(TOAST_EVENT, handleToastEvent);
      window.removeEventListener(CONFIRM_EVENT, handleConfirmEvent);
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;
    setIsConfirmLoading(true);
    try {
      await confirmDialog.onConfirm();
    } finally {
      setIsConfirmLoading(false);
      setConfirmDialog(null);
    }
  };

  const handleCancelAction = () => {
    if (confirmDialog?.onCancel) {
      confirmDialog.onCancel();
    }
    setConfirmDialog(null);
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. TOAST NOTIFICATION CONTAINER (Top-Right / Top-Center on Mobile)       */}
      {/* ========================================================================= */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 sm:right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-[92vw] sm:max-w-md w-full items-end"
      >
        <AnimatePresence>
          {toasts.map((item) => (
            <SingleToast key={item.id} item={item} onDismiss={() => removeToast(item.id)} />
          ))}
        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* 2. CONFIRMATION ALERT DIALOG MODAL (Aesthetic Match for Logout/Actions)  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Dark Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleCancelAction}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Card - Exact Sleek Dark Aesthetic from User Reference */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#0e0e11] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/80 text-white z-10 space-y-5"
            >
              {/* Header with Icon and Close Button */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                    {confirmDialog.type === 'danger' ? (
                      <LogOut className="w-6 h-6 text-[#ff4d6d]" />
                    ) : confirmDialog.type === 'warning' ? (
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                    ) : (
                      <HelpCircle className="w-6 h-6 text-sky-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                      {confirmDialog.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {confirmDialog.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCancelAction}
                  className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                  aria-label="Tutup dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelAction}
                  disabled={isConfirmLoading}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-white/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  {confirmDialog.cancelText || 'Batal'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={isConfirmLoading}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 ${
                    confirmDialog.type === 'danger'
                      ? 'bg-[#80000f] hover:bg-[#68000c] shadow-[#80000f]/30'
                      : 'bg-[#80000f] hover:bg-[#68000c]'
                  }`}
                >
                  {isConfirmLoading && (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>{confirmDialog.confirmText || 'Konfirmasi'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Individual Toast Notification Component matching the user screenshot
function SingleToast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    if (!item.duration) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, item.duration);
    return () => clearTimeout(timer);
  }, [item.duration, onDismiss]);

  const getIcon = () => {
    switch (item.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-white shrink-0" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-white shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-white shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-white shrink-0" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.95 }}
      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      className="pointer-events-auto w-full sm:w-auto min-w-[300px] sm:min-w-[340px] max-w-[420px] bg-[#0c0c0e] border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/75 flex items-center justify-between gap-3 text-white backdrop-blur-xl"
    >
      {/* Left Icon */}
      <div className="flex items-center gap-3.5 overflow-hidden">
        <div className="p-1 rounded-full text-white shrink-0">
          {getIcon()}
        </div>

        {/* Center Text */}
        <div className="overflow-hidden">
          <h4 className="text-sm font-bold text-white tracking-tight leading-snug truncate">
            {item.title}
          </h4>
          {item.description && (
            <p className="text-xs text-zinc-400 mt-0.5 leading-snug line-clamp-2 font-normal">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Right Close Button */}
      <button
        type="button"
        onClick={onDismiss}
        className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg shrink-0 cursor-pointer"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
