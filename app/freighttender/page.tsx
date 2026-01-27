'use client';

import { useRef, useEffect } from 'react';
import ContactLink from '@/app/components/ContactLink';

export default function FreightTenderPage() {
  const videoRef = useRef<HTMLDivElement>(null);

  const scrollToVideo = () => {
    videoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add Schema.org for Service/SoftwareApplication
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "FreightTender",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Closed freight tender platform for commodity and chemical traders. Structured offers, closed competition, and full auditability.",
      "provider": {
        "@type": "Organization",
        "name": "Bench Energy",
        "url": "https://www.bench.energy"
      },
      "url": "https://www.bench.energy/freighttender",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "50"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'freighttender-schema';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('freighttender-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return (
    <>
      <div className="bg-white min-h-screen">
        {/* Section 1 — Hero */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Closed Freight Tenders for Commodity & Chemical Traders
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Replace email-based freight tendering with structured offers, closed competition, and full auditability.
              </p>
              <button 
                onClick={scrollToVideo}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Watch Product Demo
              </button>
            </div>
          </div>
        </section>

        {/* Section 2 — Demo Video */}
        <section className="py-20 bg-white" ref={videoRef}>
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-xl shadow-2xl"
                src="https://www.youtube.com/embed/6DJz3wT5MIQ"
                title="FreightTender Product Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-center text-gray-600 mt-6 text-lg">
              9-minute product walkthrough — real system, no slides
            </p>
          </div>
        </section>

        {/* Section 3 — What It Solves */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center">What It Solves</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Closed tenders</h3>
                <p className="text-gray-700 leading-relaxed">
                  No cross-visibility between brokers. Each broker sees only their own participation and cannot view other bids. Prevents collusion and ensures genuine competitive bidding.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Structured offers</h3>
                <p className="text-gray-700 leading-relaxed">
                  Standardized bid format eliminates forwarding, rewriting, or manipulation. All technical terms captured systematically. Immutable submissions prevent retroactive changes.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Management visibility</h3>
                <p className="text-gray-700 leading-relaxed">
                  All bids presented in one clean table. Faster decision-making with complete transparency for traders. Side-by-side comparison of rates, vessels, and technical specifications.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Audit trail</h3>
                <p className="text-gray-700 leading-relaxed">
                  Immutable record of all actions. Prove what happened, when, and by whom, anytime for compliance and governance. Append-only logs cannot be modified or deleted.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 — Who It's For */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center">Who It's For</h2>
            <div className="max-w-3xl mx-auto">
              <ul className="space-y-4 text-lg text-gray-700">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Commodity trading companies</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Chemical trading desks</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Freight managers and C-level executives</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 5 — Detailed Capabilities */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Detailed Capabilities
            </h2>
            <p className="text-xl text-gray-600 mb-12 text-center leading-relaxed">
              Enterprise-grade closed tender platform designed for commodity and chemical trading companies.
            </p>

            {/* Capability Block 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Closed Tender Logic</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                FreightTender operates on invite-only participation. Only brokers explicitly invited by the trader can view and bid on tenders.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                There is no cross-visibility between brokers. Each broker sees only their own invitation status and their own submitted offer. This controlled competition environment prevents collusion and ensures genuine competitive bidding.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The system eliminates the problems of email-based tendering where brokers can see each other or receive forwarded communications, leading to manipulation and information leakage.
              </p>
            </div>

            {/* Capability Block 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Structured Freight Offers</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                All offers are submitted through a standardized bid format. Freight rate, vessel specifications, laycan confirmation, technical compliance, and additional comments are captured in structured fields.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Technical terms are captured once and stored systematically. There is no need for rewriting, forwarding, or manual data entry. This eliminates errors, misinterpretation, and the risk of information loss in email chains.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Once submitted, offers are immutable. This prevents retroactive changes and ensures the integrity of the bidding process.
              </p>
            </div>

            {/* Capability Block 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Management Visibility</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Traders and freight managers see all offers in a single, clean table view. Rate, vessel, technical specifications, and comments from all brokers are displayed side-by-side for immediate comparison.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                This consolidated view enables faster decision-making. Managers can quickly identify the best combination of rate and technical suitability without scrolling through multiple emails or spreadsheets.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The system reduces operational noise by presenting only the essential information needed for evaluation. All relevant details are accessible without leaving the platform.
              </p>
            </div>

            {/* Capability Block 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Awarding & Decision Control</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Traders control the awarding process. Once a tender is closed, one offer can be selected and awarded. The system records the internal rationale for the decision.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Internal comments attached to awards are visible only to the trading company, not to brokers. This allows for candid documentation of decision factors such as relationship considerations, previous performance, or strategic reasons.
              </p>
              <p className="text-gray-700 leading-relaxed">
                All awarding actions are logged with timestamps and user attribution. This creates a defensible record of decision-making for internal review and compliance purposes.
              </p>
            </div>

            {/* Capability Block 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Audit Trail & Governance</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Every action in the system generates an immutable audit log entry. Tender creation, broker invitations, offer submissions, tender closures, and awards are all recorded with user identity, timestamp, and entity reference.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                The audit log answers who did what and when. Management can review the complete history of any tender at any time. Compliance teams can verify process adherence and identify any deviations.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Audit logs are append-only and cannot be modified or deleted. This ensures the integrity of the record for regulatory compliance, internal audits, and dispute resolution.
              </p>
            </div>

            {/* Capability Block 6 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Compliance & Risk Control</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Commodity and chemical trading requires strict control over counterparty selection and documentation. FreightTender provides the structured documentation and auditability needed for regulatory compliance.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                The system reduces regulatory risk by ensuring all tender processes are documented and traceable. Counterparty risk is managed through controlled invitation and evaluation processes.
              </p>
              <p className="text-gray-700 leading-relaxed">
                For companies operating in jurisdictions with sanctions requirements or strict trade controls, the immutable audit trail provides evidence of due diligence in freight procurement decisions.
              </p>
            </div>

            {/* Capability Block 7 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">C-Level Perspective</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">CEO / General Management</h4>
                  <p className="text-gray-700 leading-relaxed">
                    Complete governance and operational control. Full visibility into freight procurement processes eliminates blind spots in critical supply chain decisions. Documented decision-making provides defensible rationale for all tender awards. Reduced risk of procedural violations, unauthorized actions, or compliance failures. Board-level accountability with transparent audit trail for all freight procurement activities. Strategic oversight capability without micromanagement.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">CFO / Finance</h4>
                  <p className="text-gray-700 leading-relaxed">
                    Direct cost leakage reduction through structured competitive bidding. Eliminates opportunities for rate manipulation, favoritism, or non-transparent pricing. Complete documentation enables accurate cost analysis, budget forecasting, and variance reporting. Supports financial audits with traceable procurement decisions. Identifies cost optimization opportunities through historical bid analysis.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Freight Director / Operations</h4>
                  <p className="text-gray-700 leading-relaxed">
                    Accelerated tender cycles with standardized, repeatable processes. Eliminates time wasted on email coordination, manual data entry, and spreadsheet consolidation. Faster decision-making with all bids visible in one interface. Reduced operational overhead and administrative burden. Consistent processes across all freight categories and trading desks.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Compliance / Risk Management</h4>
                  <p className="text-gray-700 leading-relaxed">
                    Complete auditability for regulatory compliance and internal risk controls. Immutable records satisfy regulatory reporting requirements for procurement transparency. Supports internal audit processes with complete action history. Demonstrates due diligence in counterparty selection. Enables rapid response to compliance inquiries or regulatory investigations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 — CTA */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Interested in a pilot or internal demo?</h2>
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <p className="text-lg text-gray-700 mb-4">
                  Contact us:
                </p>
                <p className="text-lg text-gray-700 mb-2">
                  Email: <ContactLink type="email" href="mailto:support@bench.energy" className="text-green-600 hover:text-green-700 font-semibold">support@bench.energy</ContactLink>
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  Telegram: <ContactLink type="telegram_sales" href="https://t.me/freightTender_sales" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 font-semibold">@freightTender_sales</ContactLink>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
