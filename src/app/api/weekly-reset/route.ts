import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current week's winners (top books by vote count)
    const { data: booksWithVotes } = await supabase
      .from('books')
      .select(`
        id,
        asin,
        title,
        votes(count)
      `)
    
    if (!booksWithVotes) {
      return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
    }

    // Sort by vote count to get rankings
    const sortedBooks = booksWithVotes.sort((a: any, b: any) => {
      const aVotes = a.votes?.[0]?.count || 0
      const bVotes = b.votes?.[0]?.count || 0
      return bVotes - aVotes
    })

    // Calculate week boundaries (Monday to Sunday)
    const now = new Date()
    const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const daysToLastMonday = currentDay === 0 ? 6 : currentDay - 1
    
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - daysToLastMonday)
    weekStart.setHours(0, 0, 0, 0)
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    // Save top performers to weekly_winners (save all books with votes > 0)
    const winnersToSave = sortedBooks
      .filter((book: any) => (book.votes?.[0]?.count || 0) > 0)
      .map((book: any, index: number) => ({
        book_id: book.id,
        week_start: weekStart.toISOString(),
        week_end: weekEnd.toISOString(),
        final_vote_count: book.votes?.[0]?.count || 0,
        position: index + 1
      }))

    if (winnersToSave.length > 0) {
      const { error: winnersError } = await supabase
        .from('weekly_winners')
        .insert(winnersToSave)

      if (winnersError) {
        console.error('Error saving weekly winners:', winnersError)
        return NextResponse.json({ error: 'Failed to save winners' }, { status: 500 })
      }
    }

    // Reset all votes for the new week
    const { error: resetError } = await supabase
      .from('votes')
      .delete()
      .neq('book_id', 'impossible-id') // Delete all votes

    if (resetError) {
      console.error('Error resetting votes:', resetError)
      return NextResponse.json({ error: 'Failed to reset votes' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Weekly reset completed',
      winnersSaved: winnersToSave.length,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString()
    })

  } catch (error) {
    console.error('Weekly reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 