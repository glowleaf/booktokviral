import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { stripe, FEATURED_BOOK_DURATION_DAYS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is properly initialized
    if (!stripe) {
      console.error('Stripe not initialized - missing environment variables')
      return new NextResponse('Payment system unavailable', { status: 503 })
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return new NextResponse('No signature', { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured')
      return new NextResponse('Webhook not configured', { status: 503 })
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    const supabase = await createServerSupabaseClient()

    // Handle one-time checkout completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      
      const { bookId, userId, bookAsin, subscriptionType } = session.metadata

      if (!bookId || !userId) {
        console.error('Missing metadata in webhook:', session.metadata)
        return new NextResponse('Missing metadata', { status: 400 })
      }

      if (subscriptionType === 'weekly_featured') {
        // This is a subscription - we'll handle the actual subscription creation in invoice.payment_succeeded
        console.log(`Subscription checkout completed for book ${bookAsin} (${bookId})`)
        return new NextResponse('Subscription checkout completed', { status: 200 })
      } else {
        // This is a one-time payment
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

        console.log(`Book ${bookAsin} (${bookId}) featured until ${featuredUntil.toISOString()}`)
        return new NextResponse('One-time payment processed', { status: 200 })
      }
    }

    // Handle subscription creation and renewals
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as any
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
      
      // Get the checkout session to access metadata
      const sessions = await stripe.checkout.sessions.list({
        subscription: subscription.id,
        limit: 1,
      })

      if (sessions.data.length === 0) {
        console.error('No checkout session found for subscription:', subscription.id)
        return new NextResponse('No checkout session found', { status: 400 })
      }

      const session = sessions.data[0]
      const { bookId, userId, bookAsin } = session.metadata || {}

      if (!bookId || !userId) {
        console.error('Missing metadata in subscription session:', session.metadata)
        return new NextResponse('Missing metadata', { status: 400 })
      }

      // Update or create subscription record
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          book_id: bookId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          status: subscription.status as any,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'stripe_subscription_id'
        })

      if (subscriptionError) {
        console.error('Error updating subscription:', subscriptionError)
        return new NextResponse('Subscription database error', { status: 500 })
      }

      // Feature the book for the next 7 days
      const featuredUntil = new Date()
      featuredUntil.setDate(featuredUntil.getDate() + FEATURED_BOOK_DURATION_DAYS)

      const { error: bookError } = await supabase
        .from('books')
        .update({
          featured_until: featuredUntil.toISOString()
        })
        .eq('id', bookId)
        .eq('created_by', userId)

      if (bookError) {
        console.error('Error featuring book:', bookError)
        return new NextResponse('Book update error', { status: 500 })
      }

      console.log(`Subscription payment processed: Book ${bookAsin} (${bookId}) featured until ${featuredUntil.toISOString()}`)
      return new NextResponse('Subscription payment processed', { status: 200 })
    }

    // Handle subscription cancellations
    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any

      // Update subscription status
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)

      if (subscriptionError) {
        console.error('Error updating subscription status:', subscriptionError)
        return new NextResponse('Subscription update error', { status: 500 })
      }

      console.log(`Subscription ${subscription.id} status updated to: ${subscription.status}`)
      return new NextResponse('Subscription status updated', { status: 200 })
    }

    return new NextResponse('Event not handled', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse('Webhook error', { status: 400 })
  }
} 