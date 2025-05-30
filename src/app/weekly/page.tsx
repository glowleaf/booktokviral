import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import Image from 'next/image'
import VoteButton from '@/components/VoteButton'
import FeatureButton from '@/components/FeatureButton'
import TikTokEmbed from '@/components/TikTokEmbed'
import { Book } from '@/types/database'

export default async function WeeklyPage() {
  const supabase = await createServerSupabaseClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
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
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-pink-600 to-purple-700 mb-6 animate-pulse">
            🏆 VIRAL LEADERBOARD 🏆
          </h1>
          <p className="text-2xl text-gray-700 font-bold mb-6">
            🔥 SEE WHICH BOOKS ARE ABSOLUTELY DOMINATING BOOKTOK RIGHT NOW! 🔥
          </p>
          <div className="bg-gradient-to-r from-yellow-100 via-pink-100 to-purple-100 border-4 border-yellow-400 rounded-2xl p-6 max-w-3xl mx-auto shadow-2xl">
            <p className="text-yellow-800 text-lg font-black">
              ⚡ VOTES RESET EVERY MONDAY AT MIDNIGHT! ⚡
              <br />
              🚨 GET YOUR VOTES IN BEFORE THE WEEK ENDS! 🚨
            </p>
          </div>
        </div>

        {sortedBooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-8xl mb-6 animate-bounce">📚</div>
            <h2 className="text-4xl font-black text-gray-900 mb-6">
              🚨 NO BOOKS YET! 🚨
            </h2>
            <p className="text-xl text-gray-700 font-bold mb-8">
              BE THE FIRST TO SUBMIT A BOOK AND START THE VIRAL REVOLUTION! 🔥
            </p>
            <Link
              href="/submit"
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-10 py-4 rounded-2xl text-xl font-black hover:scale-110 transform transition-all duration-300 shadow-2xl border-4 border-white"
            >
              🚀 SUBMIT FIRST VIRAL BOOK 🚀
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedBooks.map((book: Book, index: number) => {
              const voteCount = book.votes?.[0]?.count || 0
              const isTop3 = index < 3
              const isOwner = user?.id && book.created_by === user.id
              const isFeatured = book.featured_until && new Date(book.featured_until) > new Date()
              
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
                          src={book.cover_url || '/placeholder-book.svg'}
                          alt={book.title || `Book ${book.asin}`}
                          fill
                          className="object-cover rounded"
                          sizes="64px"
                        />
                      </div>
                    </div>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 truncate">
                        {book.title || `🔄 Loading Book ${book.asin}...`}
                      </h3>
                      {book.author && book.author !== 'Unknown Author' && (
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
                      {/* Feature Button for Book Owner */}
                      {isOwner && !isFeatured && (
                        <div className="w-full max-w-[140px]">
                          <FeatureButton bookId={book.id} />
                        </div>
                      )}
                      {isOwner && isFeatured && (
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded text-center">
                          ✨ Currently Featured
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TikTok Link */}
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