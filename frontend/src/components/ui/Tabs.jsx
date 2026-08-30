import React from 'react';

const Tabs = ({ tabs = [], activeTab, onTabChange }) => {
  return (
    <div className="bg-muted rounded-lg p-1 inline-flex gap-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              isActive
                ? 'bg-white shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export { Tabs };
