import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Bench Energy',
  description: 'Privacy Policy for Bench Energy platform and services.',
};

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
            Bench Energy ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, news platform, analysis articles, and FreightTender services.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We collect information that you provide directly to us and information collected automatically:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>
              <strong className="text-gray-900">Account Information:</strong> Name, email address, company information (for FreightTender users)
            </li>
            <li>
              <strong className="text-gray-900">Usage Data:</strong> IP addresses, browser type, pages visited, time spent on pages
            </li>
            <li>
              <strong className="text-gray-900">Communication Data:</strong> Email communications, support requests
            </li>
            <li>
              <strong className="text-gray-900">Platform Data:</strong> For FreightTender users, tender and offer information
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">3. How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">We use collected information to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Provide and improve our services</li>
            <li>Send newsletters and updates (with your consent)</li>
            <li>Respond to your inquiries and support requests</li>
            <li>Analyze usage patterns to improve user experience</li>
            <li>Ensure platform security and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Data Sharing</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We do not sell your personal information. We may share data only with:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>
              <strong className="text-gray-900">Service Providers:</strong> Trusted third parties who assist in operating our services (hosting, email delivery)
            </li>
            <li>
              <strong className="text-gray-900">Legal Requirements:</strong> When required by law or to protect our rights
            </li>
            <li>
              <strong className="text-gray-900">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Data Security</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We implement appropriate security measures to protect your data:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Encryption of data in transit (HTTPS/TLS)</li>
            <li>Secure password storage</li>
            <li>Access controls and authentication</li>
            <li>Regular security assessments</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Your Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Data portability</li>
            <li>Withdraw consent for marketing communications</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            To exercise these rights, contact us at <a href="mailto:support@bench.energy" className="text-green-600 hover:text-green-700 font-semibold">support@bench.energy</a>.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Cookies</h2>
          <p className="text-gray-700 leading-relaxed">
            We use essential cookies for website functionality and authentication. We do not use tracking cookies for advertising purposes. You can control cookies through your browser settings.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Third-Party Links</h2>
          <p className="text-gray-700 leading-relaxed">
            Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Children's Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Changes to This Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            For questions about this Privacy Policy, please contact:
          </p>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <p className="text-gray-700 mb-2">
              <strong className="text-gray-900">Bench Energy</strong>
            </p>
            <p className="text-gray-700 mb-2">
              Email: <a href="mailto:support@bench.energy" className="text-green-600 hover:text-green-700 font-semibold">support@bench.energy</a>
            </p>
            <p className="text-gray-700">
              Telegram: <a href="https://t.me/Bench_energy" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 font-semibold">@Bench_energy</a>
            </p>
          </div>
        </section>

        <div className="pt-8 border-t border-gray-200">
          <Link 
            href="/" 
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
