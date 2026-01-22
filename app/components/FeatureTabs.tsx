'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Tab {
  name: string;
  description: string;
  longDescription?: string;
  icon: React.ReactNode;
  image?: string;
}

interface FeatureTabsProps {
  tabs: Tab[];
}

export default function FeatureTabs({ tabs }: FeatureTabsProps) {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div className="mt-16 lg:mt-24">
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
        <div className="flex flex-col">
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
            {tabs[selectedTab].longDescription && (
              <p className="mt-4 text-base leading-7 text-gray-600">
                {tabs[selectedTab].longDescription}
              </p>
            )}
          </div>
        </div>
        <div className="mt-10 lg:mt-0 lg:pl-8">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 lg:aspect-square">
            {tabs[selectedTab].image ? (
              <Image
                src={tabs[selectedTab].image}
                alt={tabs[selectedTab].name}
                width={800}
                height={600}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                <div className="text-center">
                  {tabs[selectedTab].icon}
                  <p className="mt-4 text-sm font-medium text-gray-600">{tabs[selectedTab].name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
