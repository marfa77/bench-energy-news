'use client';

import { useRef } from 'react';

export default function FreightTenderPage() {
  const videoRef = useRef<HTMLDivElement>(null);

  const scrollToVideo = () => {
    videoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
        {/* Section 1 — Hero */}
        <section className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="container">
            <h1>Closed Freight Tenders for Commodity & Chemical Traders</h1>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#666' }}>
              Replace email-based freight tendering with structured offers, closed competition, and full auditability.
            </p>
            <button className="btn" onClick={scrollToVideo}>
              ▶ Watch Product Demo
            </button>
          </div>
        </section>

        {/* Section 2 — Demo Video */}
        <section className="section" ref={videoRef}>
          <div className="container">
            <div className="video-container">
              <iframe
                src="https://www.youtube.com/embed/6DJz3wT5MIQ"
                title="FreightTender Product Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p style={{ textAlign: 'center', color: '#666', marginTop: '1rem' }}>
              9-minute product walkthrough — real system, no slides
            </p>
          </div>
        </section>

        {/* Section 3 — What It Solves */}
        <section className="section">
          <div className="container">
            <h2>What It Solves</h2>
            <ul className="bullet-list">
              <li>
                <strong>Closed tenders</strong> — no cross-visibility between brokers. Each broker sees only their own participation and cannot view other bids. Prevents collusion and ensures genuine competitive bidding.
              </li>
              <li>
                <strong>Structured offers</strong> — standardized bid format eliminates forwarding, rewriting, or manipulation. All technical terms captured systematically. Immutable submissions prevent retroactive changes.
              </li>
              <li>
                <strong>Management visibility</strong> — all bids presented in one clean table. Faster decision-making with complete transparency for traders. Side-by-side comparison of rates, vessels, and technical specifications.
              </li>
              <li>
                <strong>Audit trail</strong> — immutable record of all actions. Prove what happened, when, and by whom, anytime for compliance and governance. Append-only logs cannot be modified or deleted.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4 — Who It's For */}
        <section className="section">
          <div className="container">
            <h2>Who It's For</h2>
            <ul className="bullet-list">
              <li>Commodity trading companies</li>
              <li>Chemical trading desks</li>
              <li>Freight managers and C-level executives</li>
            </ul>
          </div>
        </section>

        {/* Section 5 — CTA */}
        <section className="section" style={{ paddingBottom: '6rem' }}>
          <div className="container">
            <h2>Interested in a pilot or internal demo?</h2>
            <p>
              Contact us:<br />
              Email: <a href="mailto:support@bench.energy">support@bench.energy</a><br />
              Telegram: <a href="https://t.me/freightTender_sales" target="_blank" rel="noopener noreferrer">@freightTender_sales</a>
            </p>
            <p style={{ marginTop: '2rem' }}>
              <a href="/freighttender/capabilities">View detailed capabilities →</a>
            </p>
          </div>
        </section>
    </>
  );
}
