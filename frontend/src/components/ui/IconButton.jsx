const variants = {
  default: 'bg-white/20 hover:bg-white/30 text-white',
  danger: 'bg-danger/20 text-danger hover:bg-danger hover:text-white',
  warning: 'bg-warning/20 text-warning hover:bg-warning hover:text-white',
  success: 'bg-success/20 text-success hover:bg-success hover:text-white',
  primary: 'bg-primary/20 text-primary hover:bg-primary hover:text-gray-900',
};

export default function IconButton({
  icon: Icon,
  label,
  variant = 'default',
  onClick,
  size = 18,
  className = '',
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`p-2 border-none rounded-lg cursor-pointer transition-all duration-200
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant] || variants.default}
        ${className}`}
    >
      <Icon size={size} />
    </button>
  );
}
