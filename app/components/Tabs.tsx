'use client';

import { useState } from 'react';

interface Tab {
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
}

export default function Tabs({ tabs }: TabsProps) {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.name}
              onClick={() => setSelectedTab(index)}
              className={`
                whitespace-nowrap border-b-2 py-6 px-1 text-sm font-semibold
                ${
                  selectedTab === index
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-8">
        <div className="flex items-center gap-x-3 mb-4">
          {tabs[selectedTab].icon}
          <h3 className="text-lg font-semibold leading-7 text-gray-900">
            {tabs[selectedTab].name}
          </h3>
        </div>
        <p className="text-base leading-7 text-gray-600">
          {tabs[selectedTab].description}
        </p>
      </div>
    </div>
  );
}
