'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header style={{
      background: '#fff',
      borderBottom: '1px solid #e0e0e0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          textDecoration: 'none',
          color: '#1a1a1a',
        }}>
          <img
            src="/logo.png"
            alt="Bench Energy"
            width={50}
            height={50}
            style={{ 
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#1a1a1a',
          }}>
            Bench Energy
          </span>
        </Link>
        <nav style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'center',
        }}>
          <Link href="/" style={{
            color: '#666',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            transition: 'color 0.2s',
          }} onMouseEnter={(e) => e.currentTarget.style.color = '#0066cc'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
            Home
          </Link>
          <Link href="/news" style={{
            color: '#666',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            transition: 'color 0.2s',
          }} onMouseEnter={(e) => e.currentTarget.style.color = '#0066cc'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
            News
          </Link>
          <Link href="/blog" style={{
            color: '#666',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            transition: 'color 0.2s',
          }} onMouseEnter={(e) => e.currentTarget.style.color = '#0066cc'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
            Blog
          </Link>
          <Link href="/topics" style={{
            color: '#666',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            transition: 'color 0.2s',
          }} onMouseEnter={(e) => e.currentTarget.style.color = '#0066cc'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
            Topics
          </Link>
          <Link href="/freighttender/" style={{
            color: '#666',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            transition: 'color 0.2s',
          }} onMouseEnter={(e) => e.currentTarget.style.color = '#0066cc'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
            FreightTender
          </Link>
        </nav>
      </div>
    </header>
  );
}
