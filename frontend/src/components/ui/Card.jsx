import React from 'react';

const Card = React.forwardRef(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`rounded-xl border border-border bg-white shadow-sm ${className}`} {...props} />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`p-6 pb-0 ${className}`} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className = '', ...props }, ref) => (
  <h3 ref={ref} className={`text-xl font-semibold leading-none tracking-tight ${className}`} {...props} />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className = '', ...props }, ref) => (
  <p ref={ref} className={`text-sm text-muted-foreground mt-1 ${className}`} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`p-6 ${className}`} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`flex items-center p-6 pt-0 ${className}`} {...props} />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
