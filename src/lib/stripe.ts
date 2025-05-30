import { loadStripe } from '@stripe/stripe-js'
import Stripe from 'stripe'

// Client-side Stripe
export const getStripe = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!publishableKey) {
    console.warn('Stripe publishable key not found')
    return null
  }
  return loadStripe(publishableKey)
}

// Server-side Stripe
const createStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    console.warn('Stripe secret key not found')
    return null
  }
  
  return new Stripe(secretKey, {
    apiVersion: '2025-05-28.basil',
  })
}

export const stripe = createStripeInstance()

// Featured book pricing
export const FEATURED_BOOK_PRICE = 999 // $9.99 in cents
export const FEATURED_BOOK_DURATION_DAYS = 7 