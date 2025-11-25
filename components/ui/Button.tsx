import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-sans font-medium tracking-wide transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-ink text-paper hover:bg-ink-light hover:shadow-soft active:scale-[0.99]",
    secondary: "bg-gold text-white hover:bg-gold-dark",
    outline: "border border-ink/30 text-ink hover:border-ink hover:bg-paper",
    ghost: "text-ink-light hover:text-ink hover:bg-ink/5",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs uppercase tracking-widest",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="opacity-60">Wait...</span>
      ) : children}
    </button>
  );
};