import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import Image from 'next/image'
import TikTokEmbed from '@/components/TikTokEmbed'
import { Book } from '@/types/database'

interface WeeklyWinner {
  id: string
  book_id: string
  week_start: string
  week_end: string
  final_vote_count: number
  position: number
  created_at: string
  books: Book
}

export default async function PastViralPage() {
  const supabase = await createServerSupabaseClient()
  
  // Get historical weekly winners
  const { data: weeklyWinners } = await supabase
    .from('weekly_winners')
    .select(`
      *,
      books (
        id,
        asin,
        title,
        author,
        cover_url,
        tiktok_url,
        created_at
      )
    `)
    .order('week_start', { ascending: false })
    .order('position', { ascending: true })

  // Group winners by week
  const winnersByWeek = (weeklyWinners as WeeklyWinner[] | null)?.reduce((acc, winner) => {
    const weekKey = winner.week_start
    if (!acc[weekKey]) {
      acc[weekKey] = []
    }
    acc[weekKey].push(winner)
    return acc
  }, {} as Record<string, WeeklyWinner[]>) || {}

  // Get top 6 all-time performers (highest single-week vote counts)
  const allTimeTop = (weeklyWinners as WeeklyWinner[] | null)
    ?.sort((a, b) => b.final_vote_count - a.final_vote_count)
    .slice(0, 6) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-yellow-500 mb-4 animate-pulse">
            🏆 HALL OF VIRAL FAME 🏆
          </h1>
          <p className="text-2xl font-bold text-gray-700 mb-8">
            🔥 LEGENDARY BOOKS THAT DOMINATED BOOKTOK! 🔥
          </p>
        </div>
      </div>

      {/* All-Time Top Performers */}
      {allTimeTop.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-pink-600 to-purple-700 text-center mb-8">
            ⭐ ALL-TIME VIRAL LEGENDS ⭐
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {allTimeTop.map((winner, index) => (
              <LegendCard key={winner.id} winner={winner} rank={index + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Weekly Winners Archive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 text-center mb-8">
          📅 WEEKLY WINNERS ARCHIVE 📅
        </h2>
        
        {Object.keys(winnersByWeek).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl font-bold text-gray-600">
              🚀 First week in progress! Check back Monday for the first viral winners! 🚀
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(winnersByWeek).map(([weekStart, winners]) => (
              <WeeklyWinnersSection key={weekStart} weekStart={weekStart} winners={winners} />
            ))}
          </div>
        )}
      </div>

      {/* Back to Home */}
      <div className="text-center py-8">
        <Link
          href="/"
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl text-xl font-black hover:scale-110 transform transition-all duration-300 shadow-2xl border-4 border-white"
        >
          ← Back to Current Competition
        </Link>
      </div>
    </div>
  )
}

function LegendCard({ winner, rank }: { winner: WeeklyWinner, rank: number }) {
  const book = winner.books
  const weekStart = new Date(winner.week_start).toLocaleDateString()
  
  const rankConfig = {
    1: { bg: 'bg-yellow-400', text: 'text-yellow-900', emoji: '👑' },
    2: { bg: 'bg-gray-300', text: 'text-gray-700', emoji: '🥈' },
    3: { bg: 'bg-orange-300', text: 'text-orange-900', emoji: '🥉' },
  }
  
  const config = rankConfig[rank as keyof typeof rankConfig] || { bg: 'bg-pink-200', text: 'text-pink-800', emoji: '⭐' }

  return (
    <div className={`bg-white rounded-xl shadow-xl p-6 border-4 ${config.bg.replace('bg-', 'border-')}`}>
      <div className="text-center mb-4">
        <div className={`${config.bg} ${config.text} px-4 py-2 rounded-full text-lg font-black inline-block`}>
          {config.emoji} #{rank} Legend
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
            {book.title || `Book ${book.asin}`}
          </h3>
          {book.author && book.author !== 'Unknown Author' && (
            <p className="text-gray-600 text-sm">by {book.author}</p>
          )}
          {book.category && (
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium mt-2 inline-block">
              📚 {book.category}
            </span>
          )}
          <div className="mt-2">
            <span className="text-2xl font-black text-pink-600">{winner.final_vote_count}</span>
            <span className="text-sm text-gray-600 ml-1">votes</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Week of {weekStart}</p>
        </div>
        <Link
          href={`/books/${book.asin}`}
          className="text-pink-600 hover:text-pink-700 font-medium text-sm"
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}

function WeeklyWinnersSection({ weekStart, winners }: { weekStart: string, winners: WeeklyWinner[] }) {
  const weekDate = new Date(weekStart).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })
  
  const top3 = winners.slice(0, 3)
  const others = winners.slice(3)

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-pink-200">
      <h3 className="text-3xl font-black text-center text-gray-800 mb-6">
        Week of {weekDate}
      </h3>
      
      {/* Top 3 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {top3.map((winner) => (
            <WeeklyWinnerCard key={winner.id} winner={winner} />
          ))}
        </div>
      )}
      
      {/* Other participants */}
      {others.length > 0 && (
        <div>
          <h4 className="text-xl font-bold text-gray-700 mb-4">Other Participants:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {others.map((winner) => (
              <div key={winner.id} className="text-center">
                <div className="relative w-16 h-24 mx-auto mb-2">
                  <Image
                    src={winner.books.cover_url || '/placeholder-book.png'}
                    alt={winner.books.title || `Book ${winner.books.asin}`}
                    fill
                    className="object-cover rounded"
                    sizes="64px"
                  />
                </div>
                <p className="text-xs font-medium text-gray-600 truncate">
                  {winner.books.title || `Book ${winner.books.asin}`}
                </p>
                <p className="text-xs text-gray-500">{winner.final_vote_count} votes</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function WeeklyWinnerCard({ winner }: { winner: WeeklyWinner }) {
  const book = winner.books
  
  const positionConfig = {
    1: { emoji: '🥇', bg: 'bg-yellow-400', text: 'text-yellow-900', title: '1st Place' },
    2: { emoji: '🥈', bg: 'bg-gray-300', text: 'text-gray-700', title: '2nd Place' },
    3: { emoji: '🥉', bg: 'bg-orange-300', text: 'text-orange-900', title: '3rd Place' }
  }
  
  const config = positionConfig[winner.position as keyof typeof positionConfig]

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-4 ${config.bg.replace('bg-', 'border-')}`}>
      <div className="text-center mb-4">
        <div className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-sm font-black inline-block`}>
          {config.emoji} {config.title}
        </div>
      </div>
      <div className="flex flex-col items-center space-y-3">
        <div className="relative w-20 h-30">
          <Image
            src={book.cover_url || '/placeholder-book.png'}
            alt={book.title || `Book ${book.asin}`}
            fill
            className="object-cover rounded"
            sizes="80px"
          />
        </div>
        <div className="text-center">
          <h4 className="text-md font-bold text-gray-900 truncate">
            {book.title || `Book ${book.asin}`}
          </h4>
          {book.author && book.author !== 'Unknown Author' && (
            <p className="text-gray-600 text-xs">by {book.author}</p>
          )}
          <div className="mt-1">
            <span className="text-lg font-black text-pink-600">{winner.final_vote_count}</span>
            <span className="text-xs text-gray-600 ml-1">votes</span>
          </div>
        </div>
      </div>
    </div>
  )
} 