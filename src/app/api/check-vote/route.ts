import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')
    
    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const cookieStore = await cookies()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    let voterId: string
    
    if (user) {
      // Authenticated user
      voterId = user.id
    } else {
      // Anonymous user - check cookie
      const anonymousId = cookieStore.get('anonymous_voter_id')?.value
      if (!anonymousId) {
        // No anonymous ID yet, so they haven't voted
        return NextResponse.json({ hasVoted: false })
      }
      voterId = anonymousId
    }

    // Check if this voter has already voted for this book
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('book_id', bookId)
      .eq('voter_id', voterId)
      .single()

    return NextResponse.json({ hasVoted: !!existingVote })

  } catch (error) {
    console.error('Error checking vote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 