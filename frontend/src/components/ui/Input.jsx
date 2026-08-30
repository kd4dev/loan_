import React from 'react';

const Input = React.forwardRef(({ type = 'text', className = '', id, ...props }, ref) => {
  return (
    <input
      type={type}
      className={`h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-ring disabled:opacity-50 ${className}`}
      ref={ref}
      id={id}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };
