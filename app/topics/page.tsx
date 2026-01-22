import Link from 'next/link';

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
  return (
    <div className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="container">
        <h1 style={{ marginBottom: '1rem' }}>Coal Market Topics</h1>
        <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '3rem', maxWidth: '800px' }}>
          Comprehensive content hubs covering multiple facets of coal markets, freight, and energy industry. 
          Each hub provides definitions, comparisons, costs, and expert analysis in one place.
        </p>
        
        <div style={{
          display: 'grid',
          gap: '2rem',
        }}>
          {contentHubs.map((hub) => (
            <article key={hub.slug} style={{
              padding: '2rem',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }} className="hover-card">
              <h2 style={{ marginBottom: '0.75rem' }}>
                <Link href={`/topics/${hub.slug}`} style={{
                  color: '#1a1a1a',
                  textDecoration: 'none',
                }}>
                  {hub.title}
                </Link>
              </h2>
              <p style={{ 
                color: '#666', 
                marginBottom: '1.5rem',
                fontSize: '0.95rem',
              }}>
                {hub.description}
              </p>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.9rem', color: '#333' }}>Topics covered:</strong>
                <ul style={{ 
                  marginTop: '0.5rem',
                  paddingLeft: '1.5rem',
                  color: '#666',
                  fontSize: '0.9rem',
                }}>
                  {hub.topics.map((topic, idx) => (
                    <li key={idx}>{topic}</li>
                  ))}
                </ul>
              </div>
              <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
              }}>
                {hub.relatedArticles.map((article, idx) => (
                  <Link 
                    key={idx}
                    href={article} 
                    style={{
                      color: '#0066cc',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                    }}
                  >
                    {article === '/news' ? 'Latest News' : 
                     article === '/blog' ? 'Blog Articles' :
                     article === '/freighttender' ? 'FreightTender' : article}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
