export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using BookTok Viral ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Book Submissions</h2>
              <p className="text-gray-700 mb-4">
                When submitting books to our platform, you agree that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>You have the right to submit the book information</li>
                <li>The book information is accurate and not misleading</li>
                <li>You will not submit inappropriate, offensive, or copyrighted content</li>
                <li>You understand that Amazon links will include our affiliate tag</li>
                <li>You will not attempt to manipulate voting or gaming the system</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Amazon Affiliate Program</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Important Disclosure</h3>
                <p className="text-yellow-800 text-sm">
                  BookTok Viral participates in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
                </p>
              </div>
              <p className="text-gray-700 mb-4">
                By submitting books or using our service, you acknowledge and agree that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>All Amazon links on our platform include our affiliate tag (booktokviral-20)</li>
                <li>We may earn a commission when you purchase books through our links</li>
                <li>This does not affect the price you pay for any products</li>
                <li>Our book recommendations are based on community votes, not affiliate earnings</li>
                <li>We maintain editorial independence in our content and recommendations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Conduct</h2>
              <p className="text-gray-700 mb-4">
                You agree not to use the service to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Submit false, misleading, or inappropriate content</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to manipulate voting or rankings</li>
                <li>Spam or submit duplicate content</li>
                <li>Infringe on intellectual property rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content Ownership</h2>
              <p className="text-gray-700 mb-4">
                You retain ownership of any content you submit to BookTok Viral. However, by submitting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content on our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Moderation and Removal</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Remove any content that violates these terms</li>
                <li>Suspend or terminate user accounts for violations</li>
                <li>Moderate content to maintain community standards</li>
                <li>Update our terms of service at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Disclaimer</h2>
              <p className="text-gray-700 mb-4">
                BookTok Viral is provided "as is" without any warranties. We do not guarantee the accuracy of book information, availability of links, or uninterrupted service. Use of our platform is at your own risk.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@booktokviral.com<br />
                  <strong>Website:</strong> https://booktokviral.com/contact
                </p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-gray-500 text-center">
              By using BookTok Viral, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 