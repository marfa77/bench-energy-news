export default function DataCollectionPage() {
  return (
    <div className="py-12 md:py-20 bg-white min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Data Collection & Processing
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
          <p className="text-gray-700 leading-relaxed">
            This document provides detailed information about what data FreightTender collects, how it is processed, and why it is necessary for the operation of our closed freight tender platform.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Categories of Data Collected</h2>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Company & User Account Data</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Company name, country, timezone, and company type (Trader/Broker)</li>
            <li>User email addresses, names (first and last), and role assignments</li>
            <li>Encrypted password hashes (bcrypt, one-way encryption)</li>
            <li>Account status (active/inactive) and email verification status</li>
            <li>Last login timestamps</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Tender Data</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Cargo type and specifications</li>
            <li>Quantities (in metric tons)</li>
            <li>Load and discharge port information</li>
            <li>Laycan dates (from/to)</li>
            <li>Vessel size requirements</li>
            <li>Additional terms and conditions</li>
            <li>Submission deadlines</li>
            <li>Tender status (Draft, Open, Closed, Awarded)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Invitation Data</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Broker email addresses and company names</li>
            <li>Invitation tokens (secure, time-limited)</li>
            <li>Invitation status (Pending, Accepted, Expired)</li>
            <li>Invitation expiration dates</li>
            <li>Acceptance timestamps</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Offer Data</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Freight rates (per metric ton)</li>
            <li>Vessel names and specifications</li>
            <li>Laycan confirmation status and comments</li>
            <li>Technical compliance statements</li>
            <li>Additional comments from brokers</li>
            <li>Offer submission timestamps</li>
            <li>Offer status (Submitted, Awarded, Rejected)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Audit Log Data</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Action types (TENDER_CREATED, OFFER_SUBMITTED, TENDER_AWARDED, etc.)</li>
            <li>User identifiers (who performed the action)</li>
            <li>Company identifiers</li>
            <li>Entity references (tender ID, offer ID, invitation ID)</li>
            <li>IP addresses and user agents</li>
            <li>Precise timestamps (UTC)</li>
            <li>Action metadata (JSON format)</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Purpose of Data Collection</h2>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Platform Operation</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Data is collected to enable core platform functionality: creating tenders, inviting brokers, submitting offers, and managing the tender lifecycle.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Closed Tender Logic</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Email addresses and invitation data are essential for implementing closed, invitation-only tenders. Only invited brokers can participate, ensuring controlled competition.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Audit Trail & Compliance</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Audit logs create an immutable record of all platform actions. This is critical for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Regulatory compliance and governance</li>
            <li>Internal audit and risk management</li>
            <li>Dispute resolution</li>
            <li>Proving due diligence in freight procurement decisions</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Security & Fraud Prevention</h3>
          <p className="text-gray-700 leading-relaxed">
            IP addresses and user agents help detect and prevent unauthorized access, fraud, and security incidents.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Data Processing Legal Basis</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>
              <strong className="text-gray-900">Contract Performance:</strong> Processing is necessary to provide the FreightTender platform services under your service agreement
            </li>
            <li>
              <strong className="text-gray-900">Legitimate Interests:</strong> Audit logging, security, and fraud prevention serve legitimate business interests
            </li>
            <li>
              <strong className="text-gray-900">Legal Obligations:</strong> Compliance with applicable laws and regulatory requirements
            </li>
            <li>
              <strong className="text-gray-900">Consent:</strong> Where explicitly required by applicable law, we obtain consent for specific processing activities
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Data Minimization</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We collect only the data necessary for platform operation. For example:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>We do not collect personal information beyond what is needed for account management</li>
            <li>Audit logs contain only action metadata, not full data copies</li>
            <li>Passwords are stored as one-way hashes, never in plain text</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Data Visibility & Access Control</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            FreightTender implements strict access controls:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>
              <strong className="text-gray-900">Traders (Company Admins/Operators):</strong> See all tenders created by their company and all offers submitted to those tenders
            </li>
            <li>
              <strong className="text-gray-900">Brokers:</strong> See only tenders where they have been invited and accepted. See only their own offers. Cannot see other brokers' offers.
            </li>
            <li>
              <strong className="text-gray-900">Audit Logs:</strong> Visible only to Company Admins within their company. Brokers cannot access audit logs.
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Data Retention</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>
              <strong className="text-gray-900">Active Account Data:</strong> Retained while accounts are active
            </li>
            <li>
              <strong className="text-gray-900">Tender & Offer Data:</strong> Retained for the duration required by business needs and legal obligations
            </li>
            <li>
              <strong className="text-gray-900">Audit Logs:</strong> Retained indefinitely as immutable records required for compliance
            </li>
            <li>
              <strong className="text-gray-900">Deactivated Accounts:</strong> Data may be retained for a grace period to allow account reactivation, then anonymized or deleted per applicable law
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Third-Party Data Sharing</h2>
          <p className="text-gray-700 leading-relaxed mb-4">We share data only with:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>
              <strong className="text-gray-900">Cloud Infrastructure Providers:</strong> For hosting and data storage (e.g., AWS RDS for database, AWS S3 for backups). Data remains encrypted and subject to strict access controls.
            </li>
            <li>
              <strong className="text-gray-900">Email Service Providers:</strong> For sending invitation emails and notifications (e.g., SendGrid, AWS SES). Only email addresses and message content are shared.
            </li>
            <li>
              <strong className="text-gray-900">Legal & Regulatory Authorities:</strong> When required by law, court order, or regulatory inquiry.
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            We do not sell, rent, or share data with third parties for marketing purposes.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Data Subject Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Request access to your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion (subject to legal and contractual obligations)</li>
            <li>Object to processing (where applicable)</li>
            <li>Data portability (receive your data in a structured format)</li>
            <li>Lodge a complaint with a data protection authority</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            Note: Audit logs are immutable and cannot be modified or deleted, as they serve legal compliance purposes.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Security Measures</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>HTTPS/TLS encryption for all data in transit</li>
            <li>Database encryption at rest</li>
            <li>Bcrypt password hashing (industry standard, one-way)</li>
            <li>Role-based access control (RBAC)</li>
            <li>Secure invitation tokens (cryptographically random, time-limited)</li>
            <li>Regular security assessments and penetration testing</li>
            <li>Immutable audit logs to detect unauthorized access</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">10. International Transfers</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your data may be processed in servers located in different countries. We ensure appropriate safeguards are in place, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Standard Contractual Clauses (SCCs) where required</li>
            <li>Compliance with applicable data protection frameworks</li>
            <li>Encryption and access controls regardless of location</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Questions or Concerns</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            For questions about data collection or to exercise your rights, contact:
          </p>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <p className="text-gray-700 mb-2">
              <strong className="text-gray-900">FreightTender Data Protection</strong>
            </p>
            <p className="text-gray-700 mb-2">
              Email: <a href="mailto:support@bench.energy" className="text-green-600 hover:text-green-700 font-semibold">support@bench.energy</a>
            </p>
            <p className="text-gray-700">
              Telegram: <a href="https://t.me/freightTender_sales" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 font-semibold">@freightTender_sales</a>
            </p>
          </div>
        </section>

        <div className="pt-8 border-t border-gray-200">
          <p className="text-gray-700">
            <a href="/freighttender" className="text-green-600 hover:text-green-700 font-semibold inline-flex items-center mr-4">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </a>
            <a href="/freighttender/privacy" className="text-green-600 hover:text-green-700 font-semibold">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

