import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Book Submitted Successfully!
            </h1>
            <p className="text-gray-600 text-lg">
              Thank you for sharing your book with the BookTok community!
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              What happens next?
            </h2>
            <ul className="text-blue-800 text-sm space-y-2 text-left">
              <li>✅ Your book has been added to our database</li>
              <li>🔄 We&apos;re fetching the book details from Amazon (this may take a few minutes)</li>
              <li>📚 Your book will appear on the homepage once processing is complete</li>
              <li>❤️ Other users can start voting for your book right away</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/submit"
                className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
              >
                Submit Another Book
              </Link>
              <Link
                href="/weekly"
                className="bg-white text-pink-600 border-2 border-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
              >
                View Weekly Leaderboard
              </Link>
            </div>
            
            <Link
              href="/"
              className="block text-gray-600 hover:text-pink-600 transition-colors"
            >
              ← Back to Homepage
            </Link>
          </div>

          <div className="mt-8 p-4 bg-pink-50 rounded-lg">
            <h3 className="font-semibold text-pink-900 mb-2">💎 Want more visibility?</h3>
            <p className="text-sm text-pink-800 mb-3">
              Feature your book to appear at the top of the homepage for 7 days!
            </p>
            <button className="bg-pink-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-pink-700 transition-colors">
              Feature My Book - $9.99
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 