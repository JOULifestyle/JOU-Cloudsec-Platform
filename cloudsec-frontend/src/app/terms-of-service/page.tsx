import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              By accessing and using JOU CloudSec, you accept and agree to be bound by the terms
              and provision of this agreement. If you do not agree to abide by the above,
              please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Service Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              CloudSec provides cloud security posture management and continuous workload protection
              services for AWS environments. Our services include:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Cloud Security Posture Management (CSPM)</li>
              <li>Cloud Workload Protection Platform (CWPP)</li>
              <li>Policy Evaluation</li>
              <li>Security scanning and monitoring</li>
              <li>Compliance reporting and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. User Responsibilities
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>Providing accurate AWS account information</li>
              <li>Ensuring compliance with applicable laws and regulations</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Using the service in accordance with these terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Acceptable Use
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You agree not to use the service to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malicious code or viruses</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service for any illegal or harmful purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Data and Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your use of our service is also governed by our Privacy Policy, which is incorporated
              into these Terms by reference. Please review our Privacy Policy to understand our
              practices regarding your data.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              You retain ownership of your data, but grant us the necessary rights to provide
              our services and perform security analyses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Service Availability
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              While we strive to provide continuous service, we do not guarantee 100% uptime.
              We reserve the right to perform maintenance, updates, or temporary suspensions
              of service with reasonable notice when possible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              CloudSec shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages arising out of or related to your use of the service.
              Our total liability shall not exceed the amount paid by you for the service
              in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Termination
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Either party may terminate this agreement at any time. Upon termination,
              your access to the service will cease, and we may delete your data in accordance
              with our data retention policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to modify these terms at any time. We will notify users
              of significant changes via email or through our service. Continued use of
              the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Contact Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                Email: olasehindeisrael@gmail.com<br />
                Address: Lagos, Nigeria
              </p>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}