import { notFound } from 'next/navigation';
import Link from 'next/link';

// Content hub data (in production, this would come from a CMS or database)
const contentHubs: Record<string, any> = {
  'coal-prices': {
    title: 'Coal Prices: Market Analysis & Trends',
    answerCapsule: 'Coal prices fluctuate based on supply, demand, and regional factors. Thermal coal prices range from $80-150 per tonne, while coking coal typically trades at $200-300 per tonne. Major price drivers include Australian production, Chinese demand, and Indonesian export volumes.',
    sections: [
      {
        heading: 'Current Coal Price Levels',
        content: `Thermal coal prices in January 2026 range from $95-120 per tonne FOB Australia, representing a 15% increase from December 2025 levels. Coking coal prices have reached $245-280 per tonne, driven by strong demand from Chinese steel producers and supply constraints in Queensland, Australia. Price movements are tracked across three major benchmarks: Newcastle (thermal), Richards Bay (South Africa), and Qinhuangdao (China). Regional price differentials reflect transportation costs, quality variations, and local supply-demand dynamics.`,
        wordCount: 120
      },
      {
        heading: 'Price Comparison: Thermal vs Coking Coal',
        content: `Thermal coal, used for power generation, typically trades at lower prices than coking coal, which is essential for steel production. In January 2026, the price spread between thermal and coking coal averages $150-180 per tonne. This differential reflects coking coal's higher quality requirements and limited supply sources. Major thermal coal exporters include Indonesia (450 million tonnes annually), Australia (200 million tonnes), and Russia (180 million tonnes). Coking coal production is more concentrated, with Australia and the United States dominating global supply.`,
        wordCount: 130
      },
      {
        heading: 'Regional Price Dynamics',
        content: `Coal prices vary significantly by region due to transportation costs and local market conditions. Australian thermal coal FOB Newcastle trades at $110-125 per tonne, while Indonesian coal FOB Kalimantan ranges from $85-100 per tonne. Chinese domestic prices at Qinhuangdao port average $135-150 per tonne, reflecting import restrictions and domestic production costs. Indian import prices at major ports range from $105-120 per tonne, with demand driven by power sector requirements. European import prices, including freight, typically exceed $140 per tonne.`,
        wordCount: 140
      },
      {
        heading: 'Price Forecasting and Market Outlook',
        content: `Bench Energy analysts project thermal coal prices to remain in the $100-130 per tonne range through Q2 2026, supported by steady demand from India and Southeast Asia. Coking coal prices are expected to maintain strength above $240 per tonne due to ongoing supply constraints and robust steel production in China. Key risk factors include weather disruptions in Australia, policy changes in China, and shifts in renewable energy adoption rates. Long-term price trends will depend on energy transition timelines and infrastructure investments in coal-producing regions.`,
        wordCount: 130
      }
    ],
    expertView: {
      whatThisMeans: 'Coal prices reflect the complex interplay between supply constraints, demand patterns, and regional logistics. Current price levels indicate tight market conditions, particularly for coking coal.',
      marketImpact: 'Price movements directly affect power generation costs, steel production economics, and trade flows between major producing and consuming regions.',
      risksOpportunities: 'Price volatility creates both risks for buyers and opportunities for traders. Companies with flexible supply chains can capitalize on regional price differentials.'
    }
  },
  'freight-logistics': {
    title: 'Freight & Logistics in Coal Trading',
    answerCapsule: 'Coal freight rates depend on vessel size, route distance, and port conditions. Panamax vessels (60,000-80,000 DWT) typically charge $12-18 per tonne for Australia-China routes. Capesize vessels (150,000+ DWT) offer lower per-tonne rates but require deep-water ports. Major challenges include port congestion, weather delays, and rate volatility.',
    sections: [
      {
        heading: 'Freight Rate Structures',
        content: `Coal freight rates are quoted per metric tonne and vary by vessel size and route. Panamax vessels (60,000-80,000 DWT) charge $12-18 per tonne for Australia to China routes, while Supramax vessels (50,000-60,000 DWT) command $14-20 per tonne for shorter hauls. Capesize vessels (150,000+ DWT) offer rates of $8-12 per tonne but require deep-water ports like Newcastle and Qingdao. Rate structures include time charter equivalents (TCE) and voyage charters, with additional costs for port charges, bunker fuel, and canal fees.`,
        wordCount: 130
      },
      {
        heading: 'Major Shipping Routes and Distances',
        content: `Key coal shipping routes include Australia to China (3,500 nautical miles, 12-15 days), Indonesia to India (2,800 nautical miles, 10-12 days), and South Africa to China (7,200 nautical miles, 25-30 days). Route distances directly impact freight costs, with longer routes commanding premium rates. Port infrastructure quality affects turnaround times: modern ports like Newcastle, Australia, can load 150,000 DWT vessels in 2-3 days, while older facilities may require 5-7 days. Weather conditions, particularly in the South China Sea and Indian Ocean, can cause delays of 3-5 days during monsoon seasons.`,
        wordCount: 140
      },
      {
        heading: 'Port Operations and Congestion',
        content: `Port congestion significantly impacts freight costs and delivery schedules. Major coal export ports include Newcastle (Australia, 165 million tonnes annually), Richards Bay (South Africa, 75 million tonnes), and Tanjung Bara (Indonesia, 45 million tonnes). Congestion at these ports can increase waiting times from 2-3 days to 7-10 days, adding $2-4 per tonne to freight costs. Discharge ports in China, including Qingdao, Tianjin, and Guangzhou, handle 200-300 million tonnes annually. Port efficiency varies: modern automated facilities process vessels in 3-4 days, while older ports may require 6-8 days.`,
        wordCount: 150
      },
      {
        heading: 'Logistics Solutions for Bulk Traders',
        content: `Bulk coal traders face challenges including rate volatility, port delays, and vessel availability. Bench Energy's FreightTender platform addresses these issues through closed tender processes, structured offers, and full auditability. The platform enables traders to compare rates from multiple brokers simultaneously, reducing procurement time by 40-60%. Key benefits include transparent rate comparison, immutable audit trails, and prevention of collusion between brokers. Traders can manage multiple freight requirements across different routes and vessel sizes through a single interface, improving operational efficiency and cost control.`,
        wordCount: 130
      }
    ],
    expertView: {
      whatThisMeans: 'Freight costs represent 15-25% of delivered coal prices, making logistics optimization critical for competitive trading.',
      marketImpact: 'Freight rate movements directly affect landed costs and trade flow patterns between regions.',
      risksOpportunities: 'Port congestion and rate volatility create risks, while efficient logistics management offers cost optimization opportunities.'
    }
  }
};

export default function TopicPage({ params }: { params: { slug: string } }) {
  const hub = contentHubs[params.slug];
  
  if (!hub) {
    notFound();
  }
  
  return (
    <div className="py-12 md:py-20 bg-white min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link 
          href="/topics" 
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-8 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Topics
        </Link>
        
        <article className="prose prose-lg max-w-none">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {hub.title}
          </h1>
          
          {/* Answer Capsule for LLM */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600 p-6 md:p-8 mb-12 rounded-xl shadow-sm">
            <p className="text-base md:text-lg leading-relaxed text-gray-900 m-0">
              {hub.answerCapsule}
            </p>
          </div>
          
          {/* Content sections (120-180 words each) */}
          {hub.sections.map((section: any, idx: number) => (
            <section key={idx} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-10 pb-2 border-b border-gray-200">
                {section.heading}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {section.content}
              </p>
            </section>
          ))}
          
          {/* Expert View */}
          <section className="mt-12 p-8 bg-gray-50 rounded-xl border-l-4 border-green-600">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Bench Energy Expert View</h3>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-gray-900">What this means:</strong> {hub.expertView.whatThisMeans}
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-gray-900">Market impact:</strong> {hub.expertView.marketImpact}
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-gray-900">Risks & Opportunities:</strong> {hub.expertView.risksOpportunities}
              </p>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return [
    { slug: 'coal-prices' },
    { slug: 'freight-logistics' },
    { slug: 'australia-coal' },
    { slug: 'china-india-demand' }
  ];
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const hub = contentHubs[params.slug];
  
  if (!hub) {
    return { title: 'Topic Not Found' };
  }
  
  return {
    title: `${hub.title} | Bench Energy`,
    description: hub.answerCapsule,
    openGraph: {
      title: hub.title,
      description: hub.answerCapsule,
      type: 'article',
    },
  };
}
