import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import Image from 'next/image'
import VoteButton from '@/components/VoteButton'
import FeatureButton from '@/components/FeatureButton'
import TikTokEmbed from '@/components/TikTokEmbed'
import CountdownTimer from '@/components/CountdownTimer'
import { Book } from '@/types/database'

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get all books with vote counts, ordered by votes for current week
  const { data: allBooks } = await supabase
    .from('books')
    .select(`
      *,
      votes(count)
    `)
    .order('created_at', { ascending: false })

  // Sort books by vote count to get rankings
  const sortedBooks = (allBooks as Book[] | null)?.sort((a: Book, b: Book) => {
    const aVotes = a.votes?.[0]?.count || 0
    const bVotes = b.votes?.[0]?.count || 0
    return bVotes - aVotes
  }) || []

  // Get top 3 winners
  const winners = sortedBooks.slice(0, 3)
  const otherBooks = sortedBooks.slice(3)

  // Get featured books (premium featured)
  const { data: featuredBooks } = await supabase
    .from('books')
    .select(`
      *,
      votes(count)
    `)
    .gt('featured_until', new Date().toISOString())
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-yellow-500 mb-4">
            📚 BookTok Viral 📚
          </h1>
          <p className="text-2xl font-bold text-gray-700 mb-8">
            Launch Today, Get Viral & Win BookTok Fame! 🔥
          </p>
          
          {/* Top 3 weekly launches get exclusive badges and massive exposure */}
          <div className="bg-gradient-to-r from-yellow-100 via-pink-100 to-purple-100 border-4 border-yellow-400 rounded-2xl p-6 max-w-4xl mx-auto shadow-2xl mb-8">
            <p className="text-lg font-black text-gray-800">
              🏆 <span className="text-yellow-600">Top 3 weekly launches</span> receive exclusive badges and massive BookTok exposure. 
              <span className="text-pink-600">Featured books</span> get premium placement when you embed the badge with a link to BookTok Viral.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Premium Books Section */}
      {featuredBooks && featuredBooks.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 mb-8">
            <h2 className="text-4xl font-black text-white text-center mb-6">
              ⭐ FEATURED PREMIUM BOOKS ⭐
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featuredBooks as Book[]).map((book) => (
                <FeaturedBookCard key={book.id} book={book} currentUserId={user?.id} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Get Featured Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-3xl p-2 shadow-2xl">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/featured-booktok-viral.svg"
                alt="Get Featured"
                width={200}
                height={150}
                className="rounded-xl shadow-lg"
              />
            </div>
            <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-pink-600 to-purple-700 mb-4">
              🚀 GET FEATURED 🚀
            </h3>
            <p className="text-xl font-bold text-gray-700 mb-6">
              Premium visibility for your book. Limited spots available.
            </p>
            <Link
              href="/submit"
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl text-xl font-black hover:scale-110 transform transition-all duration-300 shadow-2xl border-4 border-white mr-4"
            >
              Submit Your Book
            </Link>
            <span className="text-2xl font-black text-gray-600">
              Get Featured for $9.99/week
            </span>
          </div>
        </div>
      </div>

      {/* Launching This Week */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 mb-4">
            🏆 Launching This Week
          </h2>
          <CountdownTimer />
        </div>

        {/* Top 3 Winners */}
        {winners.length > 0 && (
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {winners.map((book, index) => (
                <WinnerCard 
                  key={book.id} 
                  book={book} 
                  position={index + 1}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Other Books */}
        {otherBooks.length > 0 && (
          <div className="space-y-4">
            {otherBooks.map((book, index) => {
              const voteCount = book.votes?.[0]?.count || 0
              const isOwner = user?.id && book.created_by === user.id
              const isFeatured = book.featured_until && new Date(book.featured_until) > new Date()
              const position = index + 4 // Since top 3 are shown separately
              
              return (
                <div
                  key={book.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-gray-100"
                >
                  <div className="flex items-center space-x-6">
                    {/* Position */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600">
                        {position}
                      </div>
                    </div>

                    {/* Book Cover */}
                    <div className="flex-shrink-0">
                      <div className="relative w-16 h-24">
                        <Image
                          src={book.cover_url || '/placeholder-book.png'}
                          alt={book.title || `Book ${book.asin}`}
                          fill
                          className="object-cover rounded"
                          sizes="64px"
                        />
                      </div>
                    </div>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 truncate">
                        {book.title || `🔄 Loading Book ${book.asin}...`}
                      </h3>
                      {book.author && book.author !== 'Unknown Author' && (
                        <p className="text-gray-600 mt-1">by {book.author}</p>
                      )}
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-sm text-gray-500">
                          ASIN: {book.asin}
                        </span>
                        {isFeatured && (
                          <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-4">
                        <VoteButton bookId={book.id} initialVotes={voteCount} />
                        <Link
                          href={`/books/${book.asin}`}
                          className="text-pink-600 hover:text-pink-700 font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                      {isOwner && !isFeatured && (
                        <div className="w-full max-w-[140px]">
                          <FeatureButton bookId={book.id} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TikTok Embed */}
                  {book.tiktok_url && (
                    <div className="mt-4">
                      <TikTokEmbed url={book.tiktok_url} compact={true} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center mt-12">
          <Link
            href="/submit"
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-5 rounded-2xl text-2xl font-black hover:scale-110 transform transition-all duration-300 shadow-2xl border-4 border-white"
          >
            🚀 SUBMIT YOUR VIRAL BOOK NOW! 🚀
          </Link>
        </div>
      </div>
    </div>
  )
}

function FeaturedBookCard({ book, currentUserId }: { book: Book, currentUserId?: string }) {
  const voteCount = book.votes?.[0]?.count || 0
  const isOwner = currentUserId && book.created_by === currentUserId

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 border-4 border-yellow-400">
      <div className="text-center mb-4">
        <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-black">
          ⭐ FEATURED
        </span>
      </div>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-24 h-36">
          <Image
            src={book.cover_url || '/placeholder-book.png'}
            alt={book.title || `Book ${book.asin}`}
            fill
            className="object-cover rounded"
            sizes="96px"
          />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900">
            {book.title || `🔄 Loading Book ${book.asin}...`}
          </h3>
          {book.author && book.author !== 'Unknown Author' && (
            <p className="text-gray-600 text-sm">by {book.author}</p>
          )}
        </div>
        <VoteButton bookId={book.id} initialVotes={voteCount} />
        {book.tiktok_url && (
          <TikTokEmbed url={book.tiktok_url} compact={true} />
        )}
      </div>
    </div>
  )
}

function WinnerCard({ book, position, currentUserId }: { book: Book, position: number, currentUserId?: string }) {
  const voteCount = book.votes?.[0]?.count || 0
  const isOwner = currentUserId && book.created_by === currentUserId
  const isFeatured = book.featured_until && new Date(book.featured_until) > new Date()

  const positionConfig = {
    1: { emoji: '🥇', bg: 'bg-yellow-400', text: 'text-yellow-900', title: '1st Place' },
    2: { emoji: '🥈', bg: 'bg-gray-300', text: 'text-gray-700', title: '2nd Place' },
    3: { emoji: '🥉', bg: 'bg-orange-300', text: 'text-orange-900', title: '3rd Place' }
  }

  const config = positionConfig[position as keyof typeof positionConfig]

  return (
    <div className={`bg-white rounded-xl shadow-xl p-6 border-4 ${config.bg.replace('bg-', 'border-')}`}>
      <div className="text-center mb-4">
        <div className={`${config.bg} ${config.text} px-4 py-2 rounded-full text-lg font-black inline-block`}>
          {config.emoji} {config.title}
        </div>
      </div>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-24 h-36">
          <Image
            src={book.cover_url || '/placeholder-book.png'}
            alt={book.title || `Book ${book.asin}`}
            fill
            className="object-cover rounded"
            sizes="96px"
          />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900">
            {book.title || `🔄 Loading Book ${book.asin}...`}
          </h3>
          {book.author && book.author !== 'Unknown Author' && (
            <p className="text-gray-600 text-sm">by {book.author}</p>
          )}
          <div className="mt-2">
            <span className="text-2xl font-black text-gray-800">{voteCount}</span>
            <span className="text-sm text-gray-600 ml-1">votes</span>
          </div>
        </div>
        <VoteButton bookId={book.id} initialVotes={voteCount} />
        {isOwner && !isFeatured && (
          <FeatureButton bookId={book.id} />
        )}
        {book.tiktok_url && (
          <TikTokEmbed url={book.tiktok_url} compact={true} />
        )}
      </div>
    </div>
  )
}
