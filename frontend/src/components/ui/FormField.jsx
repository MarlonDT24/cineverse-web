const inputBase =
  'w-full p-3 border-none rounded-lg bg-white/90 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all';

export default function FormField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  required = false,
  placeholder,
  options,
  rows,
  readOnly = false,
  min,
  max,
  step,
  disabled = false,
  className = '',
}) {
  const id = `field-${name}`;

  const sharedProps = {
    id,
    name,
    value,
    onChange,
    required,
    placeholder,
    disabled,
    readOnly,
    className: `${inputBase} ${readOnly ? 'bg-white/60 cursor-not-allowed' : ''} ${className}`,
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-primary">
          {label}
        </label>
      )}
      {type === 'select' ? (
        <select {...sharedProps}>
          <option value="">Seleccionar...</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea {...sharedProps} rows={rows || 3} className={`${sharedProps.className} resize-y min-h-20`} />
      ) : (
        <input {...sharedProps} type={type} min={min} max={max} step={step} />
      )}
    </div>
  );
}
