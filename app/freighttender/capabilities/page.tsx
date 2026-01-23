export default function CapabilitiesPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="py-12 md:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            FreightTender Capabilities
          </h1>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
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

          {/* Footer CTA */}
          <section className="pt-8 pb-16 border-t border-gray-200 mt-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <p className="text-lg text-gray-700 mb-4">
                Interested in a pilot or internal demo? Contact us:
              </p>
              <p className="text-lg text-gray-700 mb-2">
                Email: <a href="mailto:support@bench.energy" className="text-green-600 hover:text-green-700 font-semibold">support@bench.energy</a>
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Telegram: <a href="https://t.me/freightTender_sales" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 font-semibold">@freightTender_sales</a>
              </p>
              <p className="mt-6">
                <a href="/freighttender" className="text-green-600 hover:text-green-700 font-semibold inline-flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to main page
                </a>
              </p>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

