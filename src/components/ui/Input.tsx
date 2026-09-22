import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full text-left">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-slate-800 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-white border-2 text-slate-900 rounded-xl transition-colors min-h-[48px] px-3.5 py-2.5 text-base ${
              icon ? 'pl-11' : ''
            } ${
              error
                ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-200'
                : 'border-slate-200 focus:border-emerald-700'
            } placeholder:text-slate-400 focus:outline-none ${className}`}
            {...props}
          />
        </div>
        {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
        {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
