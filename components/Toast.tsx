import React from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastType } from '../hooks/useToast';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    info: <Info size={20} />,
    warning: <AlertTriangle size={20} />
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  };

  return (
    <div className={`${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px] animate-slide-in`}>
      {icons[type]}
      <span className="flex-1 font-bold text-sm">{message}</span>
      <button onClick={onClose} className="hover:opacity-70 transition-opacity">
        <X size={18} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: Array<{ id: string; message: string; type: ToastType }>, onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );
};
