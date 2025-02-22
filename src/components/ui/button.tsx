import React from 'react';

export const Button = ({ 
  children, 
  onClick, 
  className = '',
  disabled = false,
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  size?: 'default' | 'icon';
  variant?: 'default' | 'outline';
}) => (
  <button
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
); 