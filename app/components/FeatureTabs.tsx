'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { motion } from 'framer-motion';

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
  const [selectedTab, setSelectedTab] = useState(tabs[0]?.name || '');

  return (
    <div className="mt-16 lg:mt-24">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Vertical tabs on the left */}
          <div className="flex flex-col">
            <TabsList className="flex flex-col h-auto bg-transparent p-0 border-0 gap-2 lg:gap-0">
              {tabs.map((tab, index) => (
                <TabsTrigger
                  key={tab.name}
                  value={tab.name}
                  className={`
                    w-full justify-start text-left px-6 py-6 rounded-lg border-2 transition-all
                    data-[state=active]:bg-green-50 data-[state=active]:border-green-600 data-[state=active]:text-green-800 data-[state=active]:shadow-md
                    data-[state=inactive]:bg-white data-[state=inactive]:border-gray-200 data-[state=inactive]:text-gray-900
                    hover:bg-gray-50 hover:border-gray-300
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      {tab.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold leading-7 mb-1">
                        {tab.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {tab.description}
                      </p>
                    </div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Content on the right */}
          <div className="mt-10 lg:mt-0 lg:pl-8">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.name}
                value={tab.name}
                className="focus-visible:outline-none focus-visible:ring-0 mt-0"
              >
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 lg:aspect-square"
                >
                  {tab.image ? (
                    <Image
                      src={tab.image}
                      alt={tab.name}
                      width={800}
                      height={600}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                      <div className="text-center p-8">
                        <div className="flex justify-center mb-4">
                          {tab.icon}
                        </div>
                        <p className="mt-4 text-sm font-medium text-gray-600">{tab.name}</p>
                        {tab.longDescription && (
                          <p className="mt-2 text-sm text-gray-500 max-w-md">{tab.longDescription}</p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </TabsContent>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
