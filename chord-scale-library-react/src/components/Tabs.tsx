import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { Tab } from '../lib/types';

interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  defaultValue, 
  onValueChange, 
  className = "" 
}) => {
  const defaultTab = defaultValue || tabs[0]?.id || '';

  return (
    <TabsPrimitive.Root
      defaultValue={defaultTab}
      onValueChange={onValueChange}
      className={`w-full ${className}`}
    >
      <TabsPrimitive.List className="flex space-x-1 bg-gray-800 p-1 rounded-lg mb-4">
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.id}
            value={tab.id}
            className="tab-trigger flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-gray-700 data-[state=inactive]:text-gray-300 hover:bg-gray-600"
          >
            {tab.icon && (
              <span className="text-sm">{tab.icon}</span>
            )}
            <span className="font-medium">{tab.label}</span>
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      
      {tabs.map((tab) => (
        <TabsPrimitive.Content
          key={tab.id}
          value={tab.id}
          className="outline-none"
        >
          <div className="mt-4">
            {tab.content}
          </div>
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
};

export default Tabs;
