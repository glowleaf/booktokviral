import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import Image from 'next/image'
import TikTokEmbed from '@/components/TikTokEmbed'
import { Book } from '@/types/database'

export default async function PastViralPage() {
  const supabase = await createServerSupabaseClient()
  
  // Get all books with vote counts, ordered by creation date (newest first)
  const { data: allBooks } = await supabase
    .from('books')
    .select(`
      *,
      votes(count)
    `)
    .order('created_at', { ascending: false })

  // Sort books by vote count to show most viral first
  const sortedBooks = (allBooks as Book[] | null)?.sort((a: Book, b: Book) => {
    const aVotes = a.votes?.[0]?.count || 0
    const bVotes = b.votes?.[0]?.count || 0
    return bVotes - aVotes
  }) || []

  // Group books by week (simplified - just showing all for now)
  const pastViral = sortedBooks.filter(book => {
    const voteCount = book.votes?.[0]?.count || 0
    return voteCount > 0 // Only show books that got votes
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 mb-6 animate-pulse">
            📚 PAST VIRAL BOOKTOKS 📚
          </h1>
          <p className="text-2xl text-gray-700 font-bold mb-6">
            🔥 RELIVE THE MOST VIRAL BOOKTOK MOMENTS! 🔥
          </p>
          <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 border-4 border-purple-400 rounded-2xl p-6 max-w-3xl mx-auto shadow-2xl">
            <p className="text-purple-800 text-lg font-black">
              ⭐ HALL OF FAME: Books that dominated BookTok! ⭐
              <br />
              🚨 These legends paved the way for viral success! 🚨
            </p>
          </div>
        </div>

        {pastViral.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-8xl mb-6 animate-bounce">📖</div>
            <h2 className="text-4xl font-black text-gray-900 mb-6">
              🚨 NO VIRAL HISTORY YET! 🚨
            </h2>
            <p className="text-xl text-gray-700 font-bold mb-8">
              BE THE FIRST TO CREATE VIRAL BOOKTOK HISTORY! 🔥
            </p>
            <Link
              href="/submit"
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-10 py-4 rounded-2xl text-xl font-black hover:scale-110 transform transition-all duration-300 shadow-2xl border-4 border-white"
            >
              🚀 START THE VIRAL REVOLUTION 🚀
            </Link>
          </div>
        ) : (
          <>
            {/* Hall of Fame - Top Performers */}
            <div className="mb-12">
              <h2 className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-pink-600 to-purple-700 mb-8">
                🏆 HALL OF FAME 🏆
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastViral.slice(0, 6).map((book, index) => {
                  const voteCount = book.votes?.[0]?.count || 0
                  const isTopPerformer = index < 3
                  
                  return (
                    <div
                      key={book.id}
                      className={`bg-white rounded-xl shadow-xl p-6 border-4 ${
                        isTopPerformer 
                          ? index === 0 
                            ? 'border-yellow-400' 
                            : index === 1 
                            ? 'border-gray-300' 
                            : 'border-orange-300'
                          : 'border-pink-200'
                      }`}
                    >
                      {isTopPerformer && (
                        <div className="text-center mb-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-black ${
                            index === 0 
                              ? 'bg-yellow-400 text-yellow-900' 
                              : index === 1 
                              ? 'bg-gray-300 text-gray-700' 
                              : 'bg-orange-300 text-orange-900'
                          }`}>
                            {index === 0 ? '🥇 LEGEND' : index === 1 ? '🥈 ICON' : '🥉 STAR'}
                          </span>
                        </div>
                      )}
                      
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
                            {book.title || `Book ${book.asin}`}
                          </h3>
                          {book.author && book.author !== 'Unknown Author' && (
                            <p className="text-gray-600 text-sm">by {book.author}</p>
                          )}
                          <div className="mt-2">
                            <span className="text-2xl font-black text-pink-600">{voteCount}</span>
                            <span className="text-sm text-gray-600 ml-1">viral votes</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Launched: {new Date(book.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <Link
                          href={`/books/${book.asin}`}
                          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 transform transition-all duration-300"
                        >
                          View Details
                        </Link>
                        
                        {book.tiktok_url && (
                          <TikTokEmbed url={book.tiktok_url} compact={true} />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* All Past Viral Books */}
            <div>
              <h2 className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-yellow-500 mb-8">
                📚 ALL PAST VIRAL BOOKS 📚
              </h2>
              <div className="space-y-4">
                {pastViral.map((book, index) => {
                  const voteCount = book.votes?.[0]?.count || 0
                  const isFeatured = book.featured_until && new Date(book.featured_until) > new Date()
                  
                  return (
                    <div
                      key={book.id}
                      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-gray-100"
                    >
                      <div className="flex items-center space-x-6">
                        {/* Rank */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            #{index + 1}
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
                            {book.title || `Book ${book.asin}`}
                          </h3>
                          {book.author && book.author !== 'Unknown Author' && (
                            <p className="text-gray-600 mt-1">by {book.author}</p>
                          )}
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="text-sm text-gray-500">
                              ASIN: {book.asin}
                            </span>
                            <span className="text-sm text-gray-500">
                              Launched: {new Date(book.created_at).toLocaleDateString()}
                            </span>
                            {isFeatured && (
                              <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Vote Count & Actions */}
                        <div className="flex-shrink-0 flex flex-col items-end space-y-2">
                          <div className="text-center">
                            <div className="text-2xl font-black text-pink-600">{voteCount}</div>
                            <div className="text-sm text-gray-600">viral votes</div>
                          </div>
                          <Link
                            href={`/books/${book.asin}`}
                            className="text-pink-600 hover:text-pink-700 font-medium text-sm"
                          >
                            View Details →
                          </Link>
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
            </div>
          </>
        )}

        {/* Back to Current Week */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-2xl text-xl font-black hover:scale-110 transform transition-all duration-300 shadow-2xl border-4 border-white mr-4"
          >
            ← Back to Current Week
          </Link>
          <Link
            href="/submit"
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl text-xl font-black hover:scale-110 transform transition-all duration-300 shadow-2xl border-4 border-white"
          >
            🚀 Submit Your Book 🚀
          </Link>
        </div>
      </div>
    </div>
  )
} 