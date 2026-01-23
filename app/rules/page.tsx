import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Bench Energy',
  description: 'Terms of Service for Bench Energy platform and services.',
};

export default function RulesPage() {
  return (
    <div className="py-12 md:py-20 bg-white min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        <p className="text-gray-600 mb-12 text-lg">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            By accessing and using Bench Energy services, including our website, news platform, analysis articles, and FreightTender platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Description of Services</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Bench Energy provides:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Coal market news and analysis</li>
            <li>Expert articles on freight, logistics, and energy markets</li>
            <li>FreightTender platform for closed freight tenders</li>
            <li>Market intelligence and insights</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">3. User Accounts</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            For certain services, you may be required to create an account. You agree to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Be responsible for all activities under your account</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Use of Services</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You agree to use our services only for lawful purposes and in accordance with these Terms. You agree not to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Transmit harmful or malicious code</li>
            <li>Interfere with or disrupt our services</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use our services for any fraudulent or deceptive purpose</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Intellectual Property</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            All content on Bench Energy platforms, including articles, analysis, graphics, logos, and software, is the property of Bench Energy or its licensors and is protected by copyright and other intellectual property laws. You may not:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Reproduce, distribute, or create derivative works without permission</li>
            <li>Use our content for commercial purposes without authorization</li>
            <li>Remove copyright or proprietary notices</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">6. FreightTender Platform</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            For users of the FreightTender platform:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>You are responsible for the accuracy of tender and offer information</li>
            <li>All submissions are final and cannot be modified after submission</li>
            <li>You agree to maintain confidentiality of tender information</li>
            <li>Bench Energy is not responsible for the outcome of tender awards</li>
            <li>You must comply with all applicable trade and shipping regulations</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Disclaimer of Warranties</h2>
          <p className="text-gray-700 leading-relaxed">
            Our services are provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee the accuracy, completeness, or timeliness of information provided. Market data and analysis are for informational purposes only and should not be considered as investment or trading advice.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed">
            To the maximum extent permitted by law, Bench Energy shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our services.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Indemnification</h2>
          <p className="text-gray-700 leading-relaxed">
            You agree to indemnify and hold harmless Bench Energy, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of our services or violation of these Terms.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Termination</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may terminate or suspend your access to our services immediately, without prior notice, for any reason, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Violation of these Terms of Service</li>
            <li>Fraudulent or illegal activity</li>
            <li>Non-payment of fees (where applicable)</li>
            <li>At our sole discretion</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Changes to Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            We reserve the right to modify these Terms of Service at any time. We will notify users of material changes via email or platform notification. Your continued use of our services after such changes constitutes acceptance of the modified terms.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">12. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            These Terms of Service shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">13. Contact Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            For questions about these Terms of Service, please contact:
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
