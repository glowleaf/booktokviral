import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { stripe, FEATURED_BOOK_DURATION_DAYS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return new NextResponse('No signature', { status: 400 })
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      
      const { bookId, userId, bookAsin } = session.metadata

      if (!bookId || !userId) {
        console.error('Missing metadata in webhook:', session.metadata)
        return new NextResponse('Missing metadata', { status: 400 })
      }

      const supabase = await createServerSupabaseClient()

      // Calculate featured_until date (7 days from now)
      const featuredUntil = new Date()
      featuredUntil.setDate(featuredUntil.getDate() + FEATURED_BOOK_DURATION_DAYS)

      // Update the book to be featured
      const { error: updateError } = await supabase
        .from('books')
        .update({
          featured_until: featuredUntil.toISOString()
        })
        .eq('id', bookId)
        .eq('created_by', userId)

      if (updateError) {
        console.error('Error updating book:', updateError)
        return new NextResponse('Database error', { status: 500 })
      }

      // Log the successful payment
      console.log(`Book ${bookAsin} (${bookId}) featured until ${featuredUntil.toISOString()}`)
      
      return new NextResponse('Success', { status: 200 })
    }

    return new NextResponse('Event not handled', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse('Webhook error', { status: 400 })
  }
} 