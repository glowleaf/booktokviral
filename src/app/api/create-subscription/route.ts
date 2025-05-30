import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { stripe, WEEKLY_SUBSCRIPTION_PRICE } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    console.log('Creating subscription checkout session...')
    
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

    console.log('User authenticated for subscription:', user.id)

    const { bookId } = await request.json()

    if (!bookId) {
      return new NextResponse('Book ID is required', { status: 400 })
    }

    console.log('Creating subscription for book:', bookId)

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

    console.log('Book found for subscription:', book.title || book.asin)

    // Check if required environment variables are present
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      console.error('NEXT_PUBLIC_SITE_URL not configured')
      return new NextResponse('Site URL not configured', { status: 500 })
    }

    // Create or get customer
    let customer
    try {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      })
      
      if (customers.data.length > 0) {
        customer = customers.data[0]
      } else {
        customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id,
          },
        })
      }
    } catch (error) {
      console.error('Error creating/finding customer:', error)
      return new NextResponse('Customer creation failed', { status: 500 })
    }

    // Create Stripe checkout session for subscription
    console.log('Creating Stripe subscription checkout session...')
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Weekly Featured Book Subscription',
              description: `Feature "${book.title || book.asin}" every week at the top of BookTok Viral`,
              images: book.cover_url ? [book.cover_url] : [],
            },
            unit_amount: WEEKLY_SUBSCRIPTION_PRICE,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/books/${book.asin}?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/books/${book.asin}?subscription=cancelled`,
      metadata: {
        bookId: book.id,
        userId: user.id,
        bookAsin: book.asin,
        subscriptionType: 'weekly_featured',
      },
    })

    console.log('Subscription checkout session created:', session.id)
    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating subscription checkout session:', error)
    return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 })
  }
} 