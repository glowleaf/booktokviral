import Link from 'next/link'
import Image from 'next/image'
import FeatureButton from '@/components/FeatureButton'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function SuccessPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ bookId?: string }> 
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Await searchParams as required by Next.js 15
  const resolvedSearchParams = await searchParams
  const bookId = resolvedSearchParams.bookId

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Celebration */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center mb-8 border-4 border-pink-300">
          <div className="mb-6">
            <div className="text-8xl mb-4 animate-bounce">🎉</div>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-yellow-500 mb-4">
              BOOK SUBMITTED!
            </h1>
            <p className="text-gray-700 text-xl font-semibold">
              You're officially part of the BookTok Viral community! 🔥
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              🚀 What's Happening Right Now:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">✅</span>
                <span className="text-blue-800 font-medium">Book added to our viral database</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔄</span>
                <span className="text-blue-800 font-medium">Fetching Amazon details automatically</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📚</span>
                <span className="text-blue-800 font-medium">Going live on homepage in minutes</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">❤️</span>
                <span className="text-blue-800 font-medium">Ready for votes & viral potential</span>
              </div>
            </div>
          </div>
        </div>

        {/* EXPLOSIVE FEATURE PROMOTION */}
        <div className="bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 rounded-3xl shadow-2xl p-2 mb-8">
          <div className="bg-white rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-pink-600 to-purple-700 mb-4">
                🚨 WAIT! DON'T SCROLL! 🚨
              </h2>
              <h3 className="text-4xl font-bold text-gray-900 mb-4">
                Want Your Book to GO VIRAL? 📈💥
              </h3>
              <p className="text-xl text-gray-700 font-semibold">
                Your book is live... but it's BURIED with hundreds of others! 😱
              </p>
            </div>

            {/* Featured Image */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Image
                  src="/featured-booktok-viral.png"
                  alt="Featured BookTok Viral Promotion"
                  width={400}
                  height={300}
                  className="rounded-xl shadow-lg border-4 border-yellow-400"
                />
                <div className="absolute -top-4 -right-4 bg-red-500 text-white text-xl font-bold px-4 py-2 rounded-full animate-pulse">
                  HOT! 🔥
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Problem Side */}
              <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                <h4 className="text-2xl font-bold text-red-800 mb-4 flex items-center">
                  😰 WITHOUT FEATURING:
                </h4>
                <ul className="space-y-3 text-red-700">
                  <li className="flex items-center space-x-3">
                    <span className="text-xl">❌</span>
                    <span>Lost in the crowd of 100+ books</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="text-xl">❌</span>
                    <span>Maybe 2-3 people will see it</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="text-xl">❌</span>
                    <span>Zero chance of going viral</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="text-xl">❌</span>
                    <span>Your TikTok gets NO traffic boost</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="text-xl">❌</span>
                    <span>Book stays unknown forever</span>
                  </li>
                </ul>
              </div>

              {/* Solution Side */}
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <h4 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                  🚀 WITH FEATURING:
                </h4>
                <ul className="space-y-3 text-green-700">
                  <li className="flex items-center space-x-3">
                    <span className="text-xl">✅</span>
                    <span className="font-semibold">TOP OF HOMEPAGE for 7 DAYS!</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="text-xl">✅</span>
                    <span className="font-semibold">10,000+ guaranteed views</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="text-xl">✅</span>
                    <span className="font-semibold">VIRAL potential unlocked</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="text-xl">✅</span>
                    <span className="font-semibold">Massive TikTok traffic boost</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="text-xl">✅</span>
                    <span className="font-semibold">BookTok fame & followers</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* EXPLOSIVE BENEFITS */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-8 mb-8 border-2 border-purple-300">
              <h4 className="text-3xl font-black text-center text-purple-800 mb-6">
                🎯 WHAT YOU GET FOR JUST $9.99:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">⭐</span>
                    <div>
                      <h5 className="font-bold text-purple-800">PREMIUM PLACEMENT</h5>
                      <p className="text-purple-700">Featured section at the very top of homepage</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <h5 className="font-bold text-purple-800">VIRAL BADGE</h5>
                      <p className="text-purple-700">Special "FEATURED" badge that screams authority</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">📈</span>
                    <div>
                      <h5 className="font-bold text-purple-800">MASSIVE EXPOSURE</h5>
                      <p className="text-purple-700">First thing 10,000+ daily visitors see</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">💎</span>
                    <div>
                      <h5 className="font-bold text-purple-800">PREMIUM STYLING</h5>
                      <p className="text-purple-700">Eye-catching gradient border & animations</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🎵</span>
                    <div>
                      <h5 className="font-bold text-purple-800">TIKTOK BOOST</h5>
                      <p className="text-purple-700">Your TikTok gets thousands of new views</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h5 className="font-bold text-purple-800">INSTANT CREDIBILITY</h5>
                      <p className="text-purple-700">People trust featured books more</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <h5 className="font-bold text-purple-800">LEADERBOARD DOMINATION</h5>
                      <p className="text-purple-700">Higher votes = higher ranking forever</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <h5 className="font-bold text-purple-800">AMAZON SALES BOOST</h5>
                      <p className="text-purple-700">More clicks = more book sales for you</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* URGENCY & SCARCITY */}
            <div className="bg-red-100 border-4 border-red-400 rounded-xl p-6 mb-8">
              <h4 className="text-2xl font-bold text-red-800 text-center mb-4">
                ⏰ LIMITED TIME: Feature Your Book NOW!
              </h4>
              <p className="text-red-700 text-center text-lg font-semibold mb-4">
                Only 6 featured spots available at any time! Don't let someone else steal YOUR spotlight! 🚨
              </p>
              <div className="text-center">
                <span className="bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold animate-pulse">
                  ⚡ FEATURE NOW OR REGRET FOREVER ⚡
                </span>
              </div>
            </div>

            {/* CTA BUTTONS */}
            <div className="text-center space-y-6">
              {user && bookId ? (
                <div className="max-w-md mx-auto">
                  <FeatureButton bookId={bookId} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4">
                    <p className="text-yellow-800 font-semibold">
                      🔐 Please sign in to feature your book!
                    </p>
                  </div>
                  <Link
                    href="/auth"
                    className="inline-block bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white text-xl font-black px-8 py-4 rounded-2xl shadow-2xl hover:scale-105 transform transition-all duration-300 border-4 border-white"
                  >
                    🔐 SIGN IN TO FEATURE - $9.99 🔐
                  </Link>
                </div>
              )}
              
              <p className="text-gray-600 text-sm">
                💳 Secure payment • ⚡ Instant activation • 🔒 100% safe
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
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
                  View Leaderboard
                </Link>
                <Link
                  href="/"
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <h4 className="text-xl font-bold text-gray-800 mb-4">
            🌟 Join 1000+ Authors Who Featured Their Books!
          </h4>
          <p className="text-gray-600">
            "I got 50K views on my TikTok after featuring my book! Best $9.99 I ever spent!" - @BookTokQueen
          </p>
        </div>
      </div>
    </div>
  )
} 