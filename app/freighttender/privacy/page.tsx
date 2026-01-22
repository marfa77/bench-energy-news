export default function PrivacyPage() {
  return (
    <div className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1>Privacy Policy</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2>1. Introduction</h2>
          <p>
            FreightTender ("we", "our", or "us") operates the FreightTender platform, a B2B closed freight tender system for commodity and chemical trading companies. We are committed to protecting your privacy and handling your data in accordance with applicable data protection laws.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>2. Information We Collect</h2>
          <p>
            We collect and process the following types of information:
          </p>
          <ul className="bullet-list">
            <li>
              <strong>Account Information:</strong> Company name, user email addresses, names, roles, and authentication credentials
            </li>
            <li>
              <strong>Tender Data:</strong> Cargo specifications, ports, quantities, laycan dates, and related business information
            </li>
            <li>
              <strong>Offer Data:</strong> Freight rates, vessel information, technical specifications, and bidding details
            </li>
            <li>
              <strong>Usage Data:</strong> IP addresses, user agents, timestamps, and audit logs of platform activities
            </li>
            <li>
              <strong>Communication Data:</strong> Email addresses used for invitations and notifications
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>3. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul className="bullet-list">
            <li>Provide and maintain the FreightTender platform services</li>
            <li>Process and manage freight tender invitations and submissions</li>
            <li>Maintain immutable audit trails for compliance and governance</li>
            <li>Send invitation emails and platform notifications</li>
            <li>Ensure platform security and prevent fraud</li>
            <li>Comply with legal obligations and regulatory requirements</li>
          </ul>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>4. Data Sharing and Disclosure</h2>
          <p>
            We do not sell your personal information. We may share data only in the following circumstances:
          </p>
          <ul className="bullet-list">
            <li>
              <strong>Within Closed Tenders:</strong> Tender creators can see offer submissions from invited brokers within the same tender
            </li>
            <li>
              <strong>Service Providers:</strong> With trusted third-party service providers (hosting, email delivery) under strict confidentiality agreements
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law, court order, or regulatory authority
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>5. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="bullet-list">
            <li>Encryption of data in transit (HTTPS/TLS)</li>
            <li>Encrypted password storage using bcrypt</li>
            <li>Access controls and authentication mechanisms</li>
            <li>Immutable audit logs for security monitoring</li>
            <li>Regular security assessments and updates</li>
          </ul>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>6. Data Retention</h2>
          <p>
            We retain your data for as long as necessary to:
          </p>
          <ul className="bullet-list">
            <li>Provide ongoing platform services</li>
            <li>Maintain audit trails required for compliance</li>
            <li>Comply with legal and regulatory retention requirements</li>
          </ul>
          <p>
            Audit logs are retained indefinitely as they are immutable records required for governance and compliance.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>7. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="bullet-list">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data (subject to legal and contractual obligations)</li>
            <li>Object to processing of your data</li>
            <li>Data portability</li>
          </ul>
          <p>
            To exercise these rights, please contact us at <a href="mailto:support@bench.energy">support@bench.energy</a>.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>8. Cookies and Tracking</h2>
          <p>
            FreightTender uses essential cookies for authentication and session management. We do not use tracking cookies or third-party analytics for marketing purposes.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>9. International Data Transfers</h2>
          <p>
            Your data may be processed and stored in servers located outside your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with applicable data protection laws.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify users of material changes via email or platform notification.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2>11. Contact Us</h2>
          <p>
            For questions about this Privacy Policy or our data practices, please contact:
          </p>
          <p>
            <strong>FreightTender</strong><br />
            Email: <a href="mailto:support@bench.energy">support@bench.energy</a><br />
            Telegram: <a href="https://t.me/freightTender_sales" target="_blank" rel="noopener noreferrer">@freightTender_sales</a>
          </p>
        </section>

        <p style={{ marginTop: '3rem' }}>
          <a href="/freighttender">← Back to Home</a>
        </p>
      </div>
    </div>
  );
}

