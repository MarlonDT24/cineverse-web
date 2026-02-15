export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
          <Icon size={32} className="text-text-muted" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-secondary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-muted">{description}</p>}
    </div>
  );
}
