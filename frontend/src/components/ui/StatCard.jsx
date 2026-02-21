import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import GlassCard from './GlassCard';

export default function StatCard({ icon: Icon, title, value, color, trend, sublabel, to }) {
  const navigate = useNavigate();

  return (
    <GlassCard
      accentColor={color}
      hover
      className={`p-5 relative overflow-hidden ${to ? 'cursor-pointer' : ''}`}
      onClick={to ? () => navigate(to) : undefined}
    >
      {/* Corner glow */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none"
        style={{ backgroundColor: color, opacity: 0.08 }}
      />

      {/* Icon + trend badge */}
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <Icon size={20} />
        </div>
        {trend !== undefined && trend > 0 && (
          <span
            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg"
            style={{ color: '#4caf50', backgroundColor: 'rgba(76,175,80,0.12)' }}
          >
            <TrendingUp size={11} />
            +{trend} hoy
          </span>
        )}
      </div>

      {/* Value */}
      <p className="text-3xl font-bold m-0 mb-0.5" style={{ color }}>
        {value}
      </p>

      {/* Title */}
      <p className="text-sm font-medium text-text-secondary m-0">{title}</p>

      {/* Sublabel */}
      {sublabel && (
        <p className="text-[11px] text-text-muted m-0 mt-1.5 leading-tight">{sublabel}</p>
      )}
    </GlassCard>
  );
}
