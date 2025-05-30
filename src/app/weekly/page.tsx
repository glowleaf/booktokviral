import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import Image from 'next/image'
import VoteButton from '@/components/VoteButton'
import { Book } from '@/types/database'

export default async function WeeklyPage() {
  const supabase = await createServerSupabaseClient()
  
  // Get books with vote counts, ordered by votes
  const { data: books } = await supabase
    .from('books')
    .select(`
      *,
      votes(count)
    `)
    .order('created_at', { ascending: false })

  // Sort books by vote count
  const sortedBooks = (books as Book[] | null)?.sort((a: Book, b: Book) => {
    const aVotes = a.votes?.[0]?.count || 0
    const bVotes = b.votes?.[0]?.count || 0
    return bVotes - aVotes
  }) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Weekly Leaderboard
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            See which books are trending this week on BookTok!
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-yellow-800 text-sm">
              🔄 Votes reset every Monday at midnight. Get your votes in before the week ends!
            </p>
          </div>
        </div>

        {sortedBooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No books submitted yet
            </h2>
            <p className="text-gray-600 mb-6">
              Be the first to submit a book and start the leaderboard!
            </p>
            <Link
              href="/submit"
              className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              Submit First Book
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedBooks.map((book: Book, index: number) => {
              const voteCount = book.votes?.[0]?.count || 0
              const isTop3 = index < 3
              
              return (
                <div
                  key={book.id}
                  className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
                    isTop3 ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  <div className="flex items-center space-x-6">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                          index === 0
                            ? 'bg-yellow-400 text-yellow-900'
                            : index === 1
                            ? 'bg-gray-300 text-gray-700'
                            : index === 2
                            ? 'bg-orange-300 text-orange-900'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                    </div>

                    {/* Book Cover */}
                    <div className="flex-shrink-0">
                      <div className="relative w-16 h-24">
                        <Image
                          src={book.cover_url || '/placeholder-book.png'}
                          alt={book.title || `Book ${book.asin}`}
                          fill
                          className="object-cover rounded shadow-sm"
                          sizes="64px"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder-book.png'
                          }}
                        />
                      </div>
                    </div>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 truncate">
                        {book.title || `Loading... ${book.asin}`}
                      </h3>
                      {book.author && (
                        <p className="text-gray-600 mt-1">by {book.author}</p>
                      )}
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-sm text-gray-500">
                          ASIN: {book.asin}
                        </span>
                        {book.featured_until && new Date(book.featured_until) > new Date() && (
                          <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center space-x-4">
                      <VoteButton bookId={book.id} initialVotes={voteCount} />
                      <Link
                        href={`/books/${book.asin}`}
                        className="text-pink-600 hover:text-pink-700 font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>

                  {/* TikTok Link */}
                  {book.tiktok_url && (
                    <div className="mt-4 pt-4 border-t">
                      <a
                        href={book.tiktok_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700 text-sm flex items-center"
                      >
                        🎵 View BookTok Video
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/submit"
            className="bg-pink-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-700 transition-colors"
          >
            Submit Your Book
          </Link>
        </div>
      </div>
    </div>
  )
} 