import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: (Option | string)[];
  error?: string;
  hint?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, hint, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full text-left">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-semibold text-slate-800 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full bg-white border-2 text-slate-900 rounded-xl transition-colors min-h-[48px] px-3.5 py-2.5 text-base cursor-pointer ${
            error
              ? 'border-rose-400 focus:border-rose-600'
              : 'border-slate-200 focus:border-emerald-700'
          } focus:outline-none ${className}`}
          {...props}
        >
          {options.map((opt, idx) => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const text = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={idx} value={val}>
                {text}
              </option>
            );
          })}
        </select>
        {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
        {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
