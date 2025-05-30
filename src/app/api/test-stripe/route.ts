import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET() {
  try {
    // Check if environment variables exist
    const secretKey = process.env.STRIPE_SECRET_KEY
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    
    console.log('Environment check:')
    console.log('- STRIPE_SECRET_KEY exists:', !!secretKey)
    console.log('- STRIPE_SECRET_KEY length:', secretKey?.length || 0)
    console.log('- STRIPE_SECRET_KEY starts with:', secretKey?.substring(0, 7) || 'undefined')
    console.log('- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY exists:', !!publishableKey)
    console.log('- STRIPE_WEBHOOK_SECRET exists:', !!webhookSecret)

    if (!stripe) {
      return NextResponse.json({ 
        error: 'Stripe not configured',
        configured: false,
        details: {
          secretKeyExists: !!secretKey,
          secretKeyLength: secretKey?.length || 0,
          secretKeyPrefix: secretKey?.substring(0, 7) || 'undefined'
        }
      }, { status: 503 })
    }

    // Test Stripe connection with a simple API call
    console.log('Testing Stripe API connection...')
    const account = await stripe.accounts.retrieve()
    
    return NextResponse.json({ 
      message: 'Stripe is properly configured',
      configured: true,
      accountId: account.id,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Stripe test error:', error)
    
    // Extract more specific error information
    let errorDetails = 'Unknown error'
    if (error instanceof Error) {
      errorDetails = error.message
    }
    
    return NextResponse.json({ 
      error: 'Stripe configuration error',
      configured: false,
      details: errorDetails,
      errorType: error?.constructor?.name || 'Unknown'
    }, { status: 500 })
  }
} 