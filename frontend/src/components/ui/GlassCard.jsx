export default function GlassCard({ children, className = '', accentColor, hover = false, ...props }) {
  return (
    <div
      className={`bg-surface backdrop-blur-md rounded-2xl border border-border shadow-lg
        ${hover ? 'transition-transform duration-300 hover:-translate-y-1 hover:border-border-hover' : ''}
        ${className}`}
      style={accentColor ? { borderLeft: `4px solid ${accentColor}` } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
