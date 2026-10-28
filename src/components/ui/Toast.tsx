import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium shadow-2xl backdrop-blur-md border animate-in fade-in slide-in-from-top-4 duration-200 max-w-sm w-[90%] bg-[#181824]/95 text-white border-white/10">
      {type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
      {type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
      {type === 'info' && <Info className="w-4 h-4 text-[#8B5CF6] shrink-0" />}
      <span className="flex-1 truncate">{message}</span>
      {onClose && (
        <button 
          onClick={onClose}
          aria-label="Fermer"
          className="p-1 hover:bg-white/10 rounded-md transition-colors"
        >
          <X className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
        </button>
      )}
    </div>
  );
};
