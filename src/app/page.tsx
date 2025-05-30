import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import Image from 'next/image'
import VoteButton from '@/components/VoteButton'
import { Book } from '@/types/database'

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  
  // Get featured books (books with featured_until > now)
  const { data: featuredBooks } = await supabase
    .from('books')
    .select(`
      *,
      votes(count)
    `)
    .gt('featured_until', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(6)

  // Get recent books with vote counts
  const { data: recentBooks } = await supabase
    .from('books')
    .select(`
      *,
      votes(count)
    `)
    .order('created_at', { ascending: false })
    .limit(12)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Discover Your Next
            <span className="text-pink-600"> Viral </span>
            Book
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join the BookTok community! Submit your favorite books, vote for trending reads, 
            and discover what everyone is talking about.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/submit"
              className="bg-pink-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              Submit a Book
            </Link>
            <Link 
              href="/weekly"
              className="bg-white text-pink-600 border-2 border-pink-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-50 transition-colors"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Books Section */}
      {featuredBooks && featuredBooks.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            ⭐ Featured Books
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(featuredBooks as Book[]).map((book) => (
              <BookCard key={book.id} book={book} featured={true} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Books Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          📚 Recent Submissions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(recentBooks as Book[] | null)?.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  )
}

function BookCard({ book, featured = false }: { book: Book, featured?: boolean }) {
  const voteCount = book.votes?.[0]?.count || 0

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${featured ? 'ring-2 ring-pink-400' : ''}`}>
      {featured && (
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-center py-2 text-sm font-semibold">
          ⭐ FEATURED
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative w-16 h-24 flex-shrink-0">
            <Image
              src={book.cover_url || '/placeholder-book.png'}
              alt={book.title || `Book ${book.asin}`}
              fill
              className="object-cover rounded"
              sizes="64px"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/placeholder-book.png'
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {book.title || `Loading... ${book.asin}`}
            </h3>
            {book.author && (
              <p className="text-gray-600 text-sm mt-1">by {book.author}</p>
            )}
            <div className="flex items-center justify-between mt-4">
              <VoteButton bookId={book.id} initialVotes={voteCount} />
              <Link
                href={`/books/${book.asin}`}
                className="text-pink-600 hover:text-pink-700 text-sm font-medium"
              >
                View Details →
              </Link>
            </div>
          </div>
        </div>
        {book.tiktok_url && (
          <div className="mt-4 pt-4 border-t">
            <a
              href={book.tiktok_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-700 text-sm flex items-center"
            >
              🎵 View on TikTok
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
