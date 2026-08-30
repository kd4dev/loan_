import React from 'react';

const Header = () => {
  return (
    <header className="border-b border-border bg-white py-6 mb-8">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Why Did It Say That?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Loan AI Explainer — Transparent Credit Decisions
        </p>
      </div>
    </header>
  );
};

export default Header;
