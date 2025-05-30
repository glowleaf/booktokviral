import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { stripe, FEATURED_BOOK_PRICE } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    console.log('Creating checkout session...')
    
    // Check if Stripe is properly initialized
    if (!stripe) {
      console.error('Stripe not initialized - missing environment variables')
      return new NextResponse('Payment system unavailable', { status: 503 })
    }

    const supabase = await createServerSupabaseClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new NextResponse('Unauthorized', { status: 401 })
    }

    console.log('User authenticated:', user.id)

    const { bookId } = await request.json()

    if (!bookId) {
      return new NextResponse('Book ID is required', { status: 400 })
    }

    console.log('Creating checkout for book:', bookId)

    // Verify the book exists and belongs to the user
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .eq('created_by', user.id)
      .single()

    if (bookError || !book) {
      console.error('Book not found or unauthorized:', bookError)
      return new NextResponse('Book not found or unauthorized', { status: 404 })
    }

    console.log('Book found:', book.title || book.asin)

    // Check if required environment variables are present
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      console.error('NEXT_PUBLIC_SITE_URL not configured')
      return new NextResponse('Site URL not configured', { status: 500 })
    }

    // Create Stripe checkout session
    console.log('Creating Stripe checkout session...')
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Feature Book on BookTok Viral',
              description: `Feature "${book.title || book.asin}" at the top of the homepage for 7 days`,
              images: book.cover_url ? [book.cover_url] : [],
            },
            unit_amount: FEATURED_BOOK_PRICE,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/books/${book.asin}?featured=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/books/${book.asin}?featured=cancelled`,
      metadata: {
        bookId: book.id,
        userId: user.id,
        bookAsin: book.asin,
      },
      customer_email: user.email,
    })

    console.log('Checkout session created:', session.id)
    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 })
  }
} 