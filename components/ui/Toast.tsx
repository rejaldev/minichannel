'use client';

import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

// Toast Context
interface ToastContextType {
  toast: (options: ToastOptions) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
}

interface ToastOptions {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
  open: boolean;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Toast Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const addToast = React.useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...options, id, open: true }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.map(t => t.id === id ? { ...t, open: false } : t));
    // Remove from array after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const toast = React.useCallback((options: ToastOptions) => {
    addToast(options);
  }, [addToast]);

  const success = React.useCallback((message: string, description?: string) => {
    addToast({ title: message, description, type: 'success' });
  }, [addToast]);

  const error = React.useCallback((message: string, description?: string) => {
    addToast({ title: message, description, type: 'error' });
  }, [addToast]);

  const warning = React.useCallback((message: string, description?: string) => {
    addToast({ title: message, description, type: 'warning' });
  }, [addToast]);

  const info = React.useCallback((message: string, description?: string) => {
    addToast({ title: message, description, type: 'info' });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onClose={() => removeToast(t.id)} />
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

// Toast Item Component
function ToastItem({
  id,
  title,
  description,
  type = 'info',
  duration = 4000,
  open,
  onClose,
}: ToastItem & { onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const backgrounds = {
    success: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
    error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
    warning: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950',
    info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
  };

  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={(open) => !open && onClose()}
      duration={duration}
      className={`
        group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg transition-all
        data-[swipe=cancel]:translate-x-0 
        data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] 
        data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] 
        data-[swipe=move]:transition-none 
        data-[state=open]:animate-in 
        data-[state=closed]:animate-out 
        data-[swipe=end]:animate-out 
        data-[state=closed]:fade-out-80 
        data-[state=closed]:slide-out-to-right-full 
        data-[state=open]:slide-in-from-bottom-full 
        data-[state=open]:sm:slide-in-from-bottom-full
        ${backgrounds[type]}
      `}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 grid gap-1">
        <ToastPrimitive.Title className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </ToastPrimitive.Title>
        {description && (
          <ToastPrimitive.Description className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </ToastPrimitive.Description>
        )}
      </div>
      <ToastPrimitive.Close className="absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none group-hover:opacity-100 dark:hover:text-gray-100">
        <X className="w-4 h-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

export default ToastProvider;
