import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return new NextResponse('No signature', { status: 400 })
  }

  // Initialize Stripe lazily
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-05-28.basil', // Keep the current API version for now
  })

  // Initialize Supabase with service role
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return new NextResponse('Invalid signature', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const bookId = session.metadata?.book_id
    
    if (bookId) {
      // Set featured_until to 7 days from now
      const featuredUntil = new Date()
      featuredUntil.setDate(featuredUntil.getDate() + 7)

      const { error } = await supabase
        .from('books')
        .update({ featured_until: featuredUntil.toISOString() })
        .eq('id', bookId)

      if (error) {
        console.error('Error updating book featured status:', error)
        return new NextResponse('Database error', { status: 500 })
      }

      console.log(`Book ${bookId} featured until ${featuredUntil.toISOString()}`)
    }
  }

  return new NextResponse('OK', { status: 200 })
} 