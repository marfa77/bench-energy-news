import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coal Market Topics - Analysis by Category | Bench Energy',
  description: 'Explore coal market topics including coal prices, freight logistics, Australia coal market, China and India demand, and more. Comprehensive analysis organized by category.',
  keywords: ['coal prices', 'freight logistics', 'Australia coal', 'China coal demand', 'India coal', 'coal market topics', 'energy analysis'],
  openGraph: {
    title: 'Coal Market Topics - Analysis by Category | Bench Energy',
    description: 'Explore coal market topics and analysis organized by category.',
    type: 'website',
    url: 'https://www.bench.energy/topics',
  },
  alternates: {
    canonical: 'https://www.bench.energy/topics',
  },
};

// Content hubs for topical clusters (Query Fan-Out optimization)
const contentHubs = [
  {
    slug: 'coal-prices',
    title: 'Coal Prices: Market Analysis & Trends',
    description: 'Comprehensive analysis of thermal and coking coal prices, including current rates, historical trends, and regional price dynamics in China, India, Australia, and Indonesia.',
    topics: ['Price trends', 'Regional comparisons', 'Supply and demand', 'Market forecasts'],
    relatedArticles: ['/news', '/blog']
  },
  {
    slug: 'freight-logistics',
    title: 'Freight & Logistics in Coal Trading',
    description: 'Expert insights on freight rates, shipping challenges, port operations, and logistics optimization for bulk coal trading companies.',
    topics: ['Freight rates', 'Port operations', 'Shipping routes', 'Logistics solutions'],
    relatedArticles: ['/freighttender', '/news']
  },
  {
    slug: 'australia-coal',
    title: 'Australia Coal Market: Production & Exports',
    description: 'Analysis of Australian coal production, export volumes, major mining operations, and market dynamics affecting global supply.',
    topics: ['Production volumes', 'Export statistics', 'Mining operations', 'Market impact'],
    relatedArticles: ['/news', '/blog']
  },
  {
    slug: 'china-india-demand',
    title: 'China & India: Coal Demand & Energy Transition',
    description: 'Comprehensive coverage of coal demand patterns in China and India, energy transition strategies, and their impact on global markets.',
    topics: ['Demand patterns', 'Energy transition', 'Import volumes', 'Policy changes'],
    relatedArticles: ['/news', '/blog']
  }
];

export default function TopicsPage() {
  // Schema.org for Topics/CollectionPage
  const topicsSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Coal Market Topics",
    "description": "Explore coal market topics including coal prices, freight logistics, Australia coal market, China and India demand, and more",
    "url": "https://www.bench.energy/topics",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": contentHubs.map((hub, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Article",
          "@id": `https://www.bench.energy/topics/${hub.slug}`,
          "headline": hub.title,
          "description": hub.description
        }
      }))
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(topicsSchema)
        }}
      />
      <div className="py-12 md:py-20 bg-gradient-to-b from-white to-gray-50 min-h-screen">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Coal Market Topics
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive content hubs covering multiple facets of coal markets, freight, and energy industry. 
            Each hub provides definitions, comparisons, costs, and expert analysis in one place.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {contentHubs.map((hub, index) => (
            <article 
              key={hub.slug} 
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative flex-grow flex flex-col">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-green-600 transition-colors">
                  <Link href={`/topics/${hub.slug}`} className="no-underline">
                    {hub.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-6 flex-grow text-base leading-relaxed">
                  {hub.description}
                </p>
                <div className="mb-6">
                  <strong className="text-sm font-semibold text-gray-900 block mb-2">Topics covered:</strong>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {hub.topics.map((topic, idx) => (
                      <li key={idx}>{topic}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100 mt-auto">
                  {hub.relatedArticles.map((article, idx) => (
                    <Link 
                      key={idx}
                      href={article} 
                      className="text-green-600 font-semibold text-sm hover:text-green-700 no-underline transition-colors"
                    >
                      {article === '/news' ? 'Latest News' : 
                       article === '/blog' ? 'Blog Articles' :
                       article === '/freighttender' ? 'FreightTender' : article}
                    </Link>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
