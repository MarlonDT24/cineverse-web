import GlassCard from './GlassCard';

export default function StatCard({ icon: Icon, title, value, color }) {
  return (
    <GlassCard
      accentColor={color}
      hover
      className="p-6 text-center relative overflow-hidden"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Icon size={24} />
      </div>
      <h3 className="text-sm font-medium text-text-secondary mb-2">{title}</h3>
      <p className="text-4xl font-bold m-0" style={{ color }}>
        {value}
      </p>
    </GlassCard>
  );
}
