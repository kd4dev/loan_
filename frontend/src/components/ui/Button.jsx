import React from 'react';

const Button = React.forwardRef(({ 
  children, 
  variant = 'default', 
  size = 'default', 
  disabled, 
  className = '', 
  type = 'button', 
  onClick, 
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: 'bg-foreground text-white hover:bg-foreground/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-border bg-transparent hover:bg-accent',
    ghost: 'hover:bg-accent',
    destructive: 'bg-destructive text-white hover:bg-destructive/90',
  };

  const sizes = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-12 px-6 text-lg',
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
