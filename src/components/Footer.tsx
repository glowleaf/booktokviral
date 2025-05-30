import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-pink-400 mb-4">BookTok Viral</h3>
            <p className="text-gray-300 mb-4">
              Discover trending books from the BookTok community. Vote for your favorites, 
              submit new finds, and join the conversation about the latest viral reads.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-400 transition-colors"
              >
                TikTok
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-400 transition-colors"
              >
                Instagram
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-400 transition-colors"
              >
                Twitter
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Submit Book
                </Link>
              </li>
              <li>
                <Link href="/weekly" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/auth/signin" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* FTC Disclosure */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-semibold text-yellow-400 mb-2">
              📋 FTC Disclosure - Amazon Affiliate Program
            </h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              BookTok Viral is a participant in the Amazon Services LLC Associates Program, 
              an affiliate advertising program designed to provide a means for sites to earn 
              advertising fees by advertising and linking to Amazon.com. When you click on 
              Amazon links on our site and make a purchase, we may earn a small commission 
              at no additional cost to you. This helps support our platform and keep it free 
              for the BookTok community.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              All book recommendations are genuine and based on community submissions and votes. 
              Our affiliate relationship with Amazon does not influence which books are featured 
              or recommended on our platform.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} BookTok Viral. All rights reserved.
            </p>
            <p className="mt-2 md:mt-0">
              Made with ❤️ for the BookTok community
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 