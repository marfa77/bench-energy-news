export default function DataCollectionPage() {
  return (
    <div className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1>Data Collection & Processing</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2>Overview</h2>
          <p>
            This document provides detailed information about what data FreightTender collects, how it is processed, and why it is necessary for the operation of our closed freight tender platform.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>1. Categories of Data Collected</h2>

          <h3>Company & User Account Data</h3>
          <ul className="bullet-list">
            <li>Company name, country, timezone, and company type (Trader/Broker)</li>
            <li>User email addresses, names (first and last), and role assignments</li>
            <li>Encrypted password hashes (bcrypt, one-way encryption)</li>
            <li>Account status (active/inactive) and email verification status</li>
            <li>Last login timestamps</li>
          </ul>

          <h3>Tender Data</h3>
          <ul className="bullet-list">
            <li>Cargo type and specifications</li>
            <li>Quantities (in metric tons)</li>
            <li>Load and discharge port information</li>
            <li>Laycan dates (from/to)</li>
            <li>Vessel size requirements</li>
            <li>Additional terms and conditions</li>
            <li>Submission deadlines</li>
            <li>Tender status (Draft, Open, Closed, Awarded)</li>
          </ul>

          <h3>Invitation Data</h3>
          <ul className="bullet-list">
            <li>Broker email addresses and company names</li>
            <li>Invitation tokens (secure, time-limited)</li>
            <li>Invitation status (Pending, Accepted, Expired)</li>
            <li>Invitation expiration dates</li>
            <li>Acceptance timestamps</li>
          </ul>

          <h3>Offer Data</h3>
          <ul className="bullet-list">
            <li>Freight rates (per metric ton)</li>
            <li>Vessel names and specifications</li>
            <li>Laycan confirmation status and comments</li>
            <li>Technical compliance statements</li>
            <li>Additional comments from brokers</li>
            <li>Offer submission timestamps</li>
            <li>Offer status (Submitted, Awarded, Rejected)</li>
          </ul>

          <h3>Audit Log Data</h3>
          <ul className="bullet-list">
            <li>Action types (TENDER_CREATED, OFFER_SUBMITTED, TENDER_AWARDED, etc.)</li>
            <li>User identifiers (who performed the action)</li>
            <li>Company identifiers</li>
            <li>Entity references (tender ID, offer ID, invitation ID)</li>
            <li>IP addresses and user agents</li>
            <li>Precise timestamps (UTC)</li>
            <li>Action metadata (JSON format)</li>
          </ul>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>2. Purpose of Data Collection</h2>

          <h3>Platform Operation</h3>
          <p>
            Data is collected to enable core platform functionality: creating tenders, inviting brokers, submitting offers, and managing the tender lifecycle.
          </p>

          <h3>Closed Tender Logic</h3>
          <p>
            Email addresses and invitation data are essential for implementing closed, invitation-only tenders. Only invited brokers can participate, ensuring controlled competition.
          </p>

          <h3>Audit Trail & Compliance</h3>
          <p>
            Audit logs create an immutable record of all platform actions. This is critical for:
          </p>
          <ul className="bullet-list">
            <li>Regulatory compliance and governance</li>
            <li>Internal audit and risk management</li>
            <li>Dispute resolution</li>
            <li>Proving due diligence in freight procurement decisions</li>
          </ul>

          <h3>Security & Fraud Prevention</h3>
          <p>
            IP addresses and user agents help detect and prevent unauthorized access, fraud, and security incidents.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>3. Data Processing Legal Basis</h2>
          <ul className="bullet-list">
            <li>
              <strong>Contract Performance:</strong> Processing is necessary to provide the FreightTender platform services under your service agreement
            </li>
            <li>
              <strong>Legitimate Interests:</strong> Audit logging, security, and fraud prevention serve legitimate business interests
            </li>
            <li>
              <strong>Legal Obligations:</strong> Compliance with applicable laws and regulatory requirements
            </li>
            <li>
              <strong>Consent:</strong> Where explicitly required by applicable law, we obtain consent for specific processing activities
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>4. Data Minimization</h2>
          <p>
            We collect only the data necessary for platform operation. For example:
          </p>
          <ul className="bullet-list">
            <li>We do not collect personal information beyond what is needed for account management</li>
            <li>Audit logs contain only action metadata, not full data copies</li>
            <li>Passwords are stored as one-way hashes, never in plain text</li>
          </ul>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>5. Data Visibility & Access Control</h2>
          <p>
            FreightTender implements strict access controls:
          </p>
          <ul className="bullet-list">
            <li>
              <strong>Traders (Company Admins/Operators):</strong> See all tenders created by their company and all offers submitted to those tenders
            </li>
            <li>
              <strong>Brokers:</strong> See only tenders where they have been invited and accepted. See only their own offers. Cannot see other brokers' offers.
            </li>
            <li>
              <strong>Audit Logs:</strong> Visible only to Company Admins within their company. Brokers cannot access audit logs.
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>6. Data Retention</h2>
          <ul className="bullet-list">
            <li>
              <strong>Active Account Data:</strong> Retained while accounts are active
            </li>
            <li>
              <strong>Tender & Offer Data:</strong> Retained for the duration required by business needs and legal obligations
            </li>
            <li>
              <strong>Audit Logs:</strong> Retained indefinitely as immutable records required for compliance
            </li>
            <li>
              <strong>Deactivated Accounts:</strong> Data may be retained for a grace period to allow account reactivation, then anonymized or deleted per applicable law
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>7. Third-Party Data Sharing</h2>
          <p>We share data only with:</p>
          <ul className="bullet-list">
            <li>
              <strong>Cloud Infrastructure Providers:</strong> For hosting and data storage (e.g., AWS RDS for database, AWS S3 for backups). Data remains encrypted and subject to strict access controls.
            </li>
            <li>
              <strong>Email Service Providers:</strong> For sending invitation emails and notifications (e.g., SendGrid, AWS SES). Only email addresses and message content are shared.
            </li>
            <li>
              <strong>Legal & Regulatory Authorities:</strong> When required by law, court order, or regulatory inquiry.
            </li>
          </ul>
          <p>
            We do not sell, rent, or share data with third parties for marketing purposes.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>8. Data Subject Rights</h2>
          <p>You have the right to:</p>
          <ul className="bullet-list">
            <li>Request access to your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion (subject to legal and contractual obligations)</li>
            <li>Object to processing (where applicable)</li>
            <li>Data portability (receive your data in a structured format)</li>
            <li>Lodge a complaint with a data protection authority</li>
          </ul>
          <p>
            Note: Audit logs are immutable and cannot be modified or deleted, as they serve legal compliance purposes.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>9. Security Measures</h2>
          <ul className="bullet-list">
            <li>HTTPS/TLS encryption for all data in transit</li>
            <li>Database encryption at rest</li>
            <li>Bcrypt password hashing (industry standard, one-way)</li>
            <li>Role-based access control (RBAC)</li>
            <li>Secure invitation tokens (cryptographically random, time-limited)</li>
            <li>Regular security assessments and penetration testing</li>
            <li>Immutable audit logs to detect unauthorized access</li>
          </ul>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>10. International Transfers</h2>
          <p>
            Your data may be processed in servers located in different countries. We ensure appropriate safeguards are in place, including:
          </p>
          <ul className="bullet-list">
            <li>Standard Contractual Clauses (SCCs) where required</li>
            <li>Compliance with applicable data protection frameworks</li>
            <li>Encryption and access controls regardless of location</li>
          </ul>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>11. Questions or Concerns</h2>
          <p>
            For questions about data collection or to exercise your rights, contact:
          </p>
          <p>
            <strong>FreightTender Data Protection</strong><br />
            Email: <a href="mailto:support@bench.energy">support@bench.energy</a><br />
            Telegram: <a href="https://t.me/freightTender_sales" target="_blank" rel="noopener noreferrer">@freightTender_sales</a>
          </p>
        </section>

        <p style={{ marginTop: '3rem' }}>
          <a href="/freighttender">← Back to Home</a> | <a href="/freighttender/privacy">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

