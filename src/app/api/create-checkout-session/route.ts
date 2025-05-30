import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    // Initialize Stripe lazily
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-04-30.basil',
    })

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

    // Verify the book exists
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id, title, asin')
      .eq('id', bookId)
      .single()

    if (bookError || !book) {
      return new NextResponse('Book not found', { status: 404 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Feature Book: ${book.title || book.asin}`,
              description: 'Feature your book at the top of BookTok Viral for 7 days',
            },
            unit_amount: 999, // $9.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/books/${book.asin}?featured=true`,
      cancel_url: `${request.headers.get('origin')}/books/${book.asin}`,
      metadata: {
        book_id: bookId,
        user_id: user.id,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
} 