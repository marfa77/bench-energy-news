import Link from 'next/link';

// Force static generation for home page
export const dynamic = 'force-static';
export const revalidate = false;

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section" style={{ 
        paddingTop: '6rem', 
        paddingBottom: '4rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}>
        <div className="container">
          <h1 style={{ color: 'white', fontSize: '3rem', marginBottom: '1.5rem' }}>
            Bench Energy
          </h1>
          <p style={{ 
            fontSize: '1.5rem', 
            marginBottom: '2rem', 
            color: 'rgba(255, 255, 255, 0.95)',
            maxWidth: '800px',
          }}>
            Coal market intelligence and freight tender solutions for commodity traders
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section">
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
            marginTop: '2rem',
          }}>
            {/* News Card */}
            <div style={{
              padding: '2rem',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }} className="hover-card">
              <h2 style={{ marginBottom: '1rem', color: '#1a1a1a' }}>
                📰 Coal Market News
              </h2>
              <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                Daily updates on coal markets, prices, and industry analysis with expert insights from Bench Energy.
              </p>
              <Link href="/news" style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: '#0066cc',
                color: 'white',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: 500,
              }}>
                View News →
              </Link>
            </div>

            {/* Blog Card - temporarily disabled
            <div className="service-card" style={{
              padding: '2rem',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}>
              <h2 style={{ marginBottom: '1rem', color: '#1a1a1a' }}>
                ✍️ Blog
              </h2>
              <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                In-depth articles about coal markets, freight, and energy industry insights from Bench Energy experts.
              </p>
              <Link href="/blog" style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: '#0066cc',
                color: 'white',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: 500,
              }}>
                Read Blog →
              </Link>
            </div>
            */}

            {/* FreightTender Card */}
            <div className="service-card" style={{
              padding: '2rem',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}>
              <h2 style={{ marginBottom: '1rem', color: '#1a1a1a' }}>
                🚢 FreightTender
              </h2>
              <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                Closed freight tender platform for commodity and chemical traders. Structured offers, closed competition, full auditability.
              </p>
              <Link href="/freighttender" style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: '#0066cc',
                color: 'white',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: 500,
              }}>
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section" style={{ background: '#f8f9fa' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1.5rem' }}>About Bench Energy</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
          }}>
            <div>
              <h3 style={{ marginBottom: '0.75rem' }}>Market Intelligence</h3>
              <p style={{ color: '#666' }}>
                We provide daily analysis of coal markets, price trends, and industry developments with expert commentary.
              </p>
            </div>
            <div>
              <h3 style={{ marginBottom: '0.75rem' }}>Freight Solutions</h3>
              <p style={{ color: '#666' }}>
                FreightTender platform enables structured, transparent, and auditable freight procurement for commodity traders.
              </p>
            </div>
            <div>
              <h3 style={{ marginBottom: '0.75rem' }}>Expert Insights</h3>
              <p style={{ color: '#666' }}>
                Our team provides actionable market analysis and freight procurement strategies for trading companies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Stay Updated</h2>
          <p style={{ marginBottom: '2rem', color: '#666', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Follow our Telegram channel for real-time coal market updates and freight insights.
          </p>
          <a 
            href="https://t.me/benchenergy" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#0088cc',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            📱 Join @benchenergy on Telegram
          </a>
        </div>
      </section>
    </>
  );
}
