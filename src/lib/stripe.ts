import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

// Client-side Stripe
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Server-side Stripe
const createStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    console.warn('Stripe secret key not found')
    return null
  }
  
  // Validate the secret key format
  if (!secretKey.startsWith('sk_')) {
    console.error('Invalid Stripe secret key format - must start with sk_')
    return null
  }
  
  try {
    return require('stripe')(secretKey, {
      apiVersion: '2025-05-28.basil', // Keep current API version
    })
  } catch (error) {
    console.error('Error creating Stripe instance:', error)
    return null
  }
}

export const stripe = createStripeInstance()

// Featured book pricing
export const FEATURED_BOOK_PRICE = 999 // $9.99 in cents (one-time)
export const WEEKLY_SUBSCRIPTION_PRICE = 1999 // $19.99 in cents (monthly billing for weekly featuring)
export const FEATURED_BOOK_DURATION_DAYS = 7

// Subscription product IDs (you'll need to create these in Stripe Dashboard)
export const STRIPE_PRODUCTS = {
  WEEKLY_SUBSCRIPTION: 'prod_weekly_featured_book', // Replace with actual product ID from Stripe
} 