import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Notification({ notification, onClose }) {
  if (!notification) return null;

  const { type = 'info', message, title } = notification;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  const styles = {
    success: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    error: 'bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
    warning: 'bg-amber-950/90 border-amber-500/50 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    info: 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200 shadow-[0_0_15px_rgba(0,242,254,0.2)]'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md ${styles[type] || styles.info}`}>
        {icons[type]}
        <div className="flex-1 min-w-0">
          {title && <h4 className="font-semibold text-sm mb-0.5 text-white">{title}</h4>}
          <p className="text-xs leading-relaxed break-words">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
