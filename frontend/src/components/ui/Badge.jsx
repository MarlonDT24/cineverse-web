const colorMap = {
  '2D': 'bg-primary/20 text-primary',
  '3D': 'bg-3d/20 text-3d',
  IMAX: 'bg-imax/20 text-imax',
  '4DX': 'bg-4dx/20 text-4dx',
  default: 'bg-white/20 text-white',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  const colors = colorMap[variant] || colorMap.default;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${colors} ${className}`}
    >
      {children}
    </span>
  );
}
