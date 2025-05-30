import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { stripe, FEATURED_BOOK_PRICE } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { bookId } = await request.json()

    if (!bookId) {
      return new NextResponse('Book ID is required', { status: 400 })
    }

    // Verify the book exists and belongs to the user
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .eq('created_by', user.id)
      .single()

    if (bookError || !book) {
      return new NextResponse('Book not found or unauthorized', { status: 404 })
    }

    // Create Stripe checkout session
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

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 