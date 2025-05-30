import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import VoteButton from '@/components/VoteButton'
import FeatureButton from '@/components/FeatureButton'
import TikTokEmbed from '@/components/TikTokEmbed'
import { getAmazonAffiliateLink } from '@/lib/amazon'

interface BookPageProps {
  params: Promise<{
    asin: string
  }>
  searchParams: Promise<{
    featured?: string
  }>
}

export default async function BookPage({ params, searchParams }: BookPageProps) {
  const { asin } = await params
  const { featured } = await searchParams
  const supabase = await createServerSupabaseClient()
  
  // Get book details with vote count
  const { data: book } = await supabase
    .from('books')
    .select(`
      *,
      votes(count)
    `)
    .eq('asin', asin)
    .single()

  if (!book) {
    notFound()
  }

  const voteCount = book.votes?.[0]?.count || 0
  const isFeatured = book.featured_until && new Date(book.featured_until) > new Date()
  const amazonAffiliateLink = getAmazonAffiliateLink(book.asin)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Payment Status Messages */}
        {featured === 'success' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-green-600 text-xl mr-3">✅</div>
              <div>
                <h3 className="text-green-900 font-semibold">Payment Successful!</h3>
                <p className="text-green-700 text-sm">
                  Your book is now featured at the top of the homepage for 7 days. Thank you for supporting BookTok Viral!
                </p>
              </div>
            </div>
          </div>
        )}
        
        {featured === 'cancelled' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-yellow-600 text-xl mr-3">⚠️</div>
              <div>
                <h3 className="text-yellow-900 font-semibold">Payment Cancelled</h3>
                <p className="text-yellow-700 text-sm">
                  Your payment was cancelled. You can try featuring your book again anytime.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {isFeatured && (
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-center py-3">
              <span className="text-lg font-semibold">⭐ FEATURED BOOK</span>
            </div>
          )}
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Book Cover */}
              <div className="md:col-span-1">
                <div className="relative w-full max-w-sm mx-auto aspect-[2/3]">
                  <Image
                    src={book.cover_url || '/placeholder-book.png'}
                    alt={book.title || `Book ${book.asin}`}
                    fill
                    className="object-cover rounded-lg shadow-md"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-book.png'
                    }}
                  />
                </div>
              </div>

              {/* Book Details */}
              <div className="md:col-span-2">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {book.title || `Loading... ${book.asin}`}
                  </h1>
                  {book.author && (
                    <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 mb-6">
                    <VoteButton bookId={book.id} initialVotes={voteCount} />
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-500">ASIN: {book.asin}</span>
                  </div>
                </div>

                {/* TikTok Video */}
                {book.tiktok_url && (
                  <div className="mb-6">
                    <TikTokEmbed url={book.tiktok_url} />
                  </div>
                )}

                {/* Amazon Affiliate Link */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    📚 Get This Book
                  </h3>
                  <a
                    href={amazonAffiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block"
                  >
                    Buy on Amazon
                  </a>
                  <p className="text-xs text-gray-600 mt-2">
                    * As an Amazon Associate, BookTok Viral earns from qualifying purchases
                  </p>
                </div>

                {/* Feature This Book */}
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    💎 Feature This Book
                  </h3>
                  {isFeatured ? (
                    <div className="text-sm text-yellow-800 mb-3">
                      <p className="font-medium text-green-700">✅ This book is currently featured!</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Featured until: {new Date(book.featured_until!).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-yellow-800 mb-3">
                        Feature this book at the top of the homepage for 7 days and get more votes!
                      </p>
                      <FeatureButton bookId={book.id} />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Book Stats */}
            <div className="mt-8 pt-8 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{voteCount}</div>
                  <div className="text-sm text-gray-600">Total Votes</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {new Date(book.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">Date Added</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {isFeatured ? 'Yes' : 'No'}
                  </div>
                  <div className="text-sm text-gray-600">Currently Featured</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center space-x-4">
          <Link
            href="/"
            className="text-gray-600 hover:text-pink-600 transition-colors"
          >
            ← Back to Homepage
          </Link>
          <span className="text-gray-400">•</span>
          <Link
            href="/weekly"
            className="text-gray-600 hover:text-pink-600 transition-colors"
          >
            View Leaderboard
          </Link>
          <span className="text-gray-400">•</span>
          <Link
            href="/submit"
            className="text-gray-600 hover:text-pink-600 transition-colors"
          >
            Submit Another Book
          </Link>
        </div>
      </div>
    </div>
  )
} 