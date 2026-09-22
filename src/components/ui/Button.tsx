import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'farmer';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-xl select-none cursor-pointer';

  const sizeClasses = {
    sm: 'text-sm px-3 py-2 min-h-[40px] gap-1.5',
    md: 'text-base px-4 py-2.5 min-h-[48px] gap-2',
    lg: 'text-lg px-5 py-3.5 min-h-[54px] gap-2.5 font-semibold',
    xl: 'text-xl px-6 py-4 min-h-[62px] gap-3 font-bold', // ideal for farmer mode
  };

  const variantClasses = {
    primary:
      'bg-emerald-800 text-white hover:bg-emerald-900 shadow-sm hover:shadow active:bg-emerald-950 border border-emerald-900',
    secondary:
      'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200',
    outline:
      'bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800',
    farmer:
      'bg-emerald-700 text-white text-lg hover:bg-emerald-800 active:bg-emerald-900 shadow-md border-2 border-emerald-600 font-bold',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0 flex items-center justify-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
