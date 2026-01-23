import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="py-12 md:py-20 bg-white min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-gray-600 mb-12 text-lg">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            FreightTender ("we", "our", or "us") operates the FreightTender platform, a B2B closed freight tender system for commodity and chemical trading companies. We are committed to protecting your privacy and handling your data in accordance with applicable data protection laws.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We collect and process the following types of information:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>
              <strong className="text-gray-900">Account Information:</strong> Company name, user email addresses, names, roles, and authentication credentials
            </li>
            <li>
              <strong className="text-gray-900">Tender Data:</strong> Cargo specifications, ports, quantities, laycan dates, and related business information
            </li>
            <li>
              <strong className="text-gray-900">Offer Data:</strong> Freight rates, vessel information, technical specifications, and bidding details
            </li>
            <li>
              <strong className="text-gray-900">Usage Data:</strong> IP addresses, user agents, timestamps, and audit logs of platform activities
            </li>
            <li>
              <strong className="text-gray-900">Communication Data:</strong> Email addresses used for invitations and notifications
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">3. How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">We use collected information to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Provide and maintain the FreightTender platform services</li>
            <li>Process and manage freight tender invitations and submissions</li>
            <li>Maintain immutable audit trails for compliance and governance</li>
            <li>Send invitation emails and platform notifications</li>
            <li>Ensure platform security and prevent fraud</li>
            <li>Comply with legal obligations and regulatory requirements</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Data Sharing and Disclosure</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We do not sell your personal information. We may share data only in the following circumstances:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>
              <strong className="text-gray-900">Within Closed Tenders:</strong> Tender creators can see offer submissions from invited brokers within the same tender
            </li>
            <li>
              <strong className="text-gray-900">Service Providers:</strong> With trusted third-party service providers (hosting, email delivery) under strict confidentiality agreements
            </li>
            <li>
              <strong className="text-gray-900">Legal Requirements:</strong> When required by law, court order, or regulatory authority
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Data Security</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Encryption of data in transit (HTTPS/TLS)</li>
            <li>Encrypted password storage using bcrypt</li>
            <li>Access controls and authentication mechanisms</li>
            <li>Immutable audit logs for security monitoring</li>
            <li>Regular security assessments and updates</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Data Retention</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We retain your data for as long as necessary to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>Provide ongoing platform services</li>
            <li>Maintain audit trails required for compliance</li>
            <li>Comply with legal and regulatory retention requirements</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            Audit logs are retained indefinitely as they are immutable records required for governance and compliance.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Your Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-4">Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data (subject to legal and contractual obligations)</li>
            <li>Object to processing of your data</li>
            <li>Data portability</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            To exercise these rights, please contact us at <a href="mailto:support@bench.energy" className="text-green-600 hover:text-green-700 font-semibold">support@bench.energy</a>.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Cookies and Tracking</h2>
          <p className="text-gray-700 leading-relaxed">
            FreightTender uses essential cookies for authentication and session management. We do not use tracking cookies or third-party analytics for marketing purposes.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">9. International Data Transfers</h2>
          <p className="text-gray-700 leading-relaxed">
            Your data may be processed and stored in servers located outside your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with applicable data protection laws.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Changes to This Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify users of material changes via email or platform notification.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            For questions about this Privacy Policy or our data practices, please contact:
          </p>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <p className="text-gray-700 mb-2">
              <strong className="text-gray-900">FreightTender</strong>
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
          <Link 
            href="/freighttender" 
            className="text-green-600 hover:text-green-700 font-semibold inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

