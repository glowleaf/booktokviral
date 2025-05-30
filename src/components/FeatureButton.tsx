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
    console.log('Feature button clicked for book:', bookId)
    setIsLoading(true)
    setError('')

    try {
      console.log('Making request to create checkout session...')
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        if (response.status === 503) {
          throw new Error('Payment system is currently unavailable. Please try again later.')
        }
        if (response.status === 401) {
          throw new Error('Please sign in to feature this book.')
        }
        if (response.status === 404) {
          throw new Error('Book not found or you can only feature books you submitted.')
        }
        throw new Error(errorText || 'Failed to create checkout session')
      }

      const responseData = await response.json()
      console.log('Response data:', responseData)
      const { sessionId } = responseData
      
      if (!sessionId) {
        throw new Error('No session ID received from server')
      }

      console.log('Getting Stripe instance...')
      const stripe = await getStripe()
      if (!stripe) {
        console.error('Stripe not available')
        setError('Payment system is currently unavailable. Please try again later.')
        return
      }

      console.log('Redirecting to Stripe checkout...')
      const { error } = await stripe.redirectToCheckout({ sessionId })
      if (error) {
        console.error('Stripe error:', error)
        setError('Payment failed. Please try again.')
      }
    } catch (error) {
      console.error('Error in handleFeature:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    }

    setIsLoading(false)
  }

  return (
    <div>
      <button
        onClick={handleFeature}
        disabled={isLoading}
        className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
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