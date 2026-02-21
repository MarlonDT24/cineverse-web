import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export const TOAST_CONFIG = {
  success: { icon: CheckCircle,   color: '#4caf50', bg: 'rgba(76,175,80,0.12)',   border: 'rgba(76,175,80,0.3)' },
  error:   { icon: XCircle,       color: '#f44336', bg: 'rgba(244,67,54,0.12)',   border: 'rgba(244,67,54,0.3)' },
  warning: { icon: AlertTriangle, color: '#ff9800', bg: 'rgba(255,152,0,0.12)',   border: 'rgba(255,152,0,0.3)' },
  info:    { icon: Info,          color: '#45b7d1', bg: 'rgba(69,183,209,0.12)',  border: 'rgba(69,183,209,0.3)' },
};

export default function ToastItem({ toast, onRemove }) {
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.success;
  const Icon = config.icon;

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-xl border min-w-[280px] max-w-sm"
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        animation: 'fadeIn 0.25s ease forwards',
      }}
    >
      <Icon size={18} style={{ color: config.color }} className="shrink-0 mt-0.5" />
      <p className="text-sm font-medium flex-1 m-0 leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 text-text-muted hover:text-text-primary transition-colors"
      >
        <X size={15} />
      </button>
    </div>
  );
}
