import React, { useState } from 'react';

export const Tabs = ({ defaultValue, children, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div className={className}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
};

export const TabsList = ({ children, activeTab, setActiveTab, className = '' }) => (
  <div className={`inline-flex rounded-md border ${className}`}>
    {React.Children.map(children, child =>
      React.cloneElement(child, { activeTab, setActiveTab })
    )}
  </div>
);

export const TabsTrigger = ({
  value,
  children,
  activeTab,
  setActiveTab,
  className = ''
}) => (
  <button
    onClick={() => setActiveTab(value)}
    className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
      activeTab === value
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:text-gray-900'
    } ${className}`}
  >
    {children}
  </button>
);

export const TabsContent = ({ value, children, activeTab }) =>
  activeTab === value ? <div>{children}</div> : null;