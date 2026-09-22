import React from 'react';

interface BrandLogoProps {
  compact?: boolean;
  darkSurface?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ compact = false, darkSurface = false, className = '' }) => (
  <span className={`inline-flex items-center whitespace-nowrap font-extrabold tracking-tight ${compact ? 'text-xl' : 'text-3xl'} ${darkSurface ? 'text-emerald-100' : 'text-emerald-900'} ${className}`}>
    Farm<span className={darkSurface ? 'text-lime-300' : 'text-lime-600'}>E</span>
  </span>
);
