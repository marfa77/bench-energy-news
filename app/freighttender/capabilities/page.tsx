export default function CapabilitiesPage() {
  return (
    <main>
      <section className="section" style={{ paddingTop: '4rem' }}>
        <div className="container">
          <h1>FreightTender Capabilities</h1>
          <p style={{ fontSize: '1.125rem', marginBottom: '3rem', color: '#666', maxWidth: '800px' }}>
            Enterprise-grade closed tender platform designed for commodity and chemical trading companies.
          </p>

          {/* Capability Block 1 */}
          <div className="capability-block">
            <h3>Closed Tender Logic</h3>
            <p>
              FreightTender operates on invite-only participation. Only brokers explicitly invited by the trader can view and bid on tenders.
            </p>
            <p>
              There is no cross-visibility between brokers. Each broker sees only their own invitation status and their own submitted offer. This controlled competition environment prevents collusion and ensures genuine competitive bidding.
            </p>
            <p>
              The system eliminates the problems of email-based tendering where brokers can see each other or receive forwarded communications, leading to manipulation and information leakage.
            </p>
          </div>

          {/* Capability Block 2 */}
          <div className="capability-block">
            <h3>Structured Freight Offers</h3>
            <p>
              All offers are submitted through a standardized bid format. Freight rate, vessel specifications, laycan confirmation, technical compliance, and additional comments are captured in structured fields.
            </p>
            <p>
              Technical terms are captured once and stored systematically. There is no need for rewriting, forwarding, or manual data entry. This eliminates errors, misinterpretation, and the risk of information loss in email chains.
            </p>
            <p>
              Once submitted, offers are immutable. This prevents retroactive changes and ensures the integrity of the bidding process.
            </p>
          </div>

          {/* Capability Block 3 */}
          <div className="capability-block">
            <h3>Management Visibility</h3>
            <p>
              Traders and freight managers see all offers in a single, clean table view. Rate, vessel, technical specifications, and comments from all brokers are displayed side-by-side for immediate comparison.
            </p>
            <p>
              This consolidated view enables faster decision-making. Managers can quickly identify the best combination of rate and technical suitability without scrolling through multiple emails or spreadsheets.
            </p>
            <p>
              The system reduces operational noise by presenting only the essential information needed for evaluation. All relevant details are accessible without leaving the platform.
            </p>
          </div>

          {/* Capability Block 4 */}
          <div className="capability-block">
            <h3>Awarding & Decision Control</h3>
            <p>
              Traders control the awarding process. Once a tender is closed, one offer can be selected and awarded. The system records the internal rationale for the decision.
            </p>
            <p>
              Internal comments attached to awards are visible only to the trading company, not to brokers. This allows for candid documentation of decision factors such as relationship considerations, previous performance, or strategic reasons.
            </p>
            <p>
              All awarding actions are logged with timestamps and user attribution. This creates a defensible record of decision-making for internal review and compliance purposes.
            </p>
          </div>

          {/* Capability Block 5 */}
          <div className="capability-block">
            <h3>Audit Trail & Governance</h3>
            <p>
              Every action in the system generates an immutable audit log entry. Tender creation, broker invitations, offer submissions, tender closures, and awards are all recorded with user identity, timestamp, and entity reference.
            </p>
            <p>
              The audit log answers who did what and when. Management can review the complete history of any tender at any time. Compliance teams can verify process adherence and identify any deviations.
            </p>
            <p>
              Audit logs are append-only and cannot be modified or deleted. This ensures the integrity of the record for regulatory compliance, internal audits, and dispute resolution.
            </p>
          </div>

          {/* Capability Block 6 */}
          <div className="capability-block">
            <h3>Compliance & Risk Control</h3>
            <p>
              Commodity and chemical trading requires strict control over counterparty selection and documentation. FreightTender provides the structured documentation and auditability needed for regulatory compliance.
            </p>
            <p>
              The system reduces regulatory risk by ensuring all tender processes are documented and traceable. Counterparty risk is managed through controlled invitation and evaluation processes.
            </p>
            <p>
              For companies operating in jurisdictions with sanctions requirements or strict trade controls, the immutable audit trail provides evidence of due diligence in freight procurement decisions.
            </p>
          </div>

          {/* Capability Block 7 */}
          <div className="capability-block">
            <h3>C-Level Perspective</h3>
            <p>
              <strong>CEO / General Management:</strong> Complete governance and operational control. Full visibility into freight procurement processes eliminates blind spots in critical supply chain decisions. Documented decision-making provides defensible rationale for all tender awards. Reduced risk of procedural violations, unauthorized actions, or compliance failures. Board-level accountability with transparent audit trail for all freight procurement activities. Strategic oversight capability without micromanagement.
            </p>
            <p>
              <strong>CFO / Finance:</strong> Direct cost leakage reduction through structured competitive bidding. Eliminates opportunities for rate manipulation, favoritism, or non-transparent pricing. Complete documentation enables accurate cost analysis, budget forecasting, and variance reporting. Supports financial audits with traceable procurement decisions. Identifies cost optimization opportunities through historical bid analysis.
            </p>
            <p>
              <strong>Freight Director / Operations:</strong> Accelerated tender cycles with standardized, repeatable processes. Eliminates time wasted on email coordination, manual data entry, and spreadsheet consolidation. Faster decision-making with all bids visible in one interface. Reduced operational overhead and administrative burden. Consistent processes across all freight categories and trading desks.
            </p>
            <p>
              <strong>Compliance / Risk Management:</strong> Complete auditability for regulatory compliance and internal risk controls. Immutable records satisfy regulatory reporting requirements for procurement transparency. Supports internal audit processes with complete action history. Demonstrates due diligence in counterparty selection. Enables rapid response to compliance inquiries or regulatory investigations.
            </p>
          </div>

          {/* Footer CTA */}
          <section className="section" style={{ paddingTop: '2rem', paddingBottom: '4rem', borderTop: '1px solid #e0e0e0' }}>
            <p>
              Interested in a pilot or internal demo? Contact us:<br />
              Email: <a href="mailto:support@bench.energy">support@bench.energy</a><br />
              Telegram: <a href="https://t.me/freightTender_sales" target="_blank" rel="noopener noreferrer">@freightTender_sales</a>
            </p>
            <p style={{ marginTop: '1rem' }}>
              <a href="/freighttender">← Back to main page</a>
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}

