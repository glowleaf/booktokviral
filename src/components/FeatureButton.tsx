'use client'

import { useState } from 'react'
import { getStripe } from '@/lib/stripe'

interface FeatureButtonProps {
  bookId: string
}

export default function FeatureButton({ bookId }: FeatureButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFeature = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        if (response.status === 503) {
          throw new Error('Payment system is currently unavailable. Please try again later.')
        }
        throw new Error(errorText || 'Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      
      const stripe = await getStripe()
      if (!stripe) {
        setError('Payment system is currently unavailable. Please try again later.')
        return
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })
      if (error) {
        console.error('Stripe error:', error)
        setError('Payment failed. Please try again.')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    }

    setIsLoading(false)
  }

  return (
    <div>
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
      {error && (
        <p className="text-red-600 text-xs mt-2">{error}</p>
      )}
    </div>
  )
} 