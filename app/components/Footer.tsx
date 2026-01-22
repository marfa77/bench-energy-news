'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      background: '#f8f9fa',
      borderTop: '1px solid #e0e0e0',
      padding: '3rem 0 2rem',
      marginTop: '4rem',
    }}>
      <div className="container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: '#1a1a1a',
            }}>
              Product
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/news" style={{
                  color: '#666',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}>
                  News
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/freighttender/capabilities" style={{
                  color: '#666',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}>
                  FreightTender Capabilities
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: '#1a1a1a',
            }}>
              Legal
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/freighttender/privacy/" style={{
                  color: '#666',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s',
                }} onMouseEnter={(e) => e.currentTarget.style.color = '#0066cc'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Privacy Policy
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/freighttender/data-collection/" style={{
                  color: '#666',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s',
                }} onMouseEnter={(e) => e.currentTarget.style.color = '#0066cc'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Data Collection
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: '#1a1a1a',
            }}>
              Contact
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="mailto:support@bench.energy" style={{
                  color: '#666',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}>
                  support@bench.energy
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="https://t.me/freightTender_sales" target="_blank" rel="noopener noreferrer" style={{
                  color: '#666',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}>
                  Telegram: @freightTender_sales
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div style={{
          borderTop: '1px solid #e0e0e0',
          paddingTop: '2rem',
          textAlign: 'center',
          color: '#999',
          fontSize: '0.875rem',
        }}>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} FreightTender by Bench Energy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

