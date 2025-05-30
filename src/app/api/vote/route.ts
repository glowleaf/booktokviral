import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { bookId } = await request.json()
    
    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const cookieStore = await cookies()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    let voterId: string
    let isAnonymous = false
    
    if (user) {
      // Authenticated user
      voterId = user.id
    } else {
      // Anonymous user - use cookie-based tracking
      isAnonymous = true
      let anonymousId = cookieStore.get('anonymous_voter_id')?.value
      
      if (!anonymousId) {
        // Create new anonymous ID
        anonymousId = `anon_${uuidv4()}`
        // Set cookie for 1 year
        const response = NextResponse.json({ success: true })
        response.cookies.set('anonymous_voter_id', anonymousId, {
          maxAge: 365 * 24 * 60 * 60, // 1 year
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
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

    if (existingVote) {
      return NextResponse.json({ error: 'Already voted' }, { status: 409 })
    }

    // Insert the vote
    const { error } = await supabase
      .from('votes')
      .insert({
        book_id: bookId,
        voter_id: voterId,
        user_id: user?.id || null,
        is_anonymous: isAnonymous
      })

    if (error) {
      console.error('Error inserting vote:', error)
      return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
    }

    // Get updated vote count
    const { data: voteCount } = await supabase
      .from('votes')
      .select('*', { count: 'exact' })
      .eq('book_id', bookId)

    const response = NextResponse.json({ 
      success: true, 
      voteCount: voteCount?.length || 0,
      isAnonymous 
    })

    // Set cookie for anonymous users
    if (isAnonymous) {
      response.cookies.set('anonymous_voter_id', voterId, {
        maxAge: 365 * 24 * 60 * 60, // 1 year
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    }

    return response

  } catch (error) {
    console.error('Error in vote API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 