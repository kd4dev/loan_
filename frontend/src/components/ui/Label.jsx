import React from 'react';

const Label = ({ children, htmlFor, className = '', ...props }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium text-foreground ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

export { Label };
