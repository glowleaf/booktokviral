'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

interface FeatureButtonProps {
  bookId: string
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function FeatureButton({ bookId }: FeatureButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleFeature = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          priceId: 'price_feature_book', // This would be your Stripe price ID
        }),
      })

      const { sessionId } = await response.json()
      
      const stripe = await stripePromise
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          console.error('Stripe error:', error)
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    }

    setIsLoading(false)
  }

  return (
    <button
      onClick={handleFeature}
      disabled={isLoading}
      className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <span className="flex items-center">
          <span className="animate-spin mr-2">⏳</span>
          Processing...
        </span>
      ) : (
        'Feature for $9.99'
      )}
    </button>
  )
} 