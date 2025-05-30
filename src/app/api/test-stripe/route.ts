import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET() {
  try {
    if (!stripe) {
      return NextResponse.json({ 
        error: 'Stripe not configured',
        configured: false 
      }, { status: 503 })
    }

    // Test Stripe connection by listing payment methods (this doesn't create anything)
    const paymentMethods = await stripe.paymentMethods.list({
      type: 'card',
      limit: 1,
    })

    return NextResponse.json({ 
      message: 'Stripe is properly configured',
      configured: true,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Stripe test error:', error)
    return NextResponse.json({ 
      error: 'Stripe configuration error',
      configured: false,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 