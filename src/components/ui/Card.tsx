import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'farmer' | 'flat' | 'interactive';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'bg-white rounded-2xl transition-all duration-150';

  const variantClasses = {
    default: 'border border-slate-200/80 shadow-xs p-5',
    flat: 'border border-slate-200 p-4 bg-slate-50/50',
    interactive:
      'border-2 border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-600 active:scale-[0.98] cursor-pointer p-5',
    farmer:
      'border-2 border-emerald-100 shadow-sm hover:border-emerald-600 active:scale-[0.97] cursor-pointer p-6 bg-white',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
