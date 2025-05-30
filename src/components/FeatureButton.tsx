'use client'

import { useState, useEffect } from 'react'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase'

interface FeatureButtonProps {
  bookId: string
}

export default function FeatureButton({ bookId }: FeatureButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showOptions, setShowOptions] = useState(false)
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)

  useEffect(() => {
    checkSubscriptionStatus()
  }, [bookId])

  const checkSubscriptionStatus = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('book_id', bookId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      setHasActiveSubscription(!!subscription)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const handleFeature = async (isSubscription = false) => {
    setIsLoading(true)
    setError('')

    try {
      const endpoint = isSubscription ? '/api/create-subscription' : '/api/create-checkout-session'
      
      const response = await fetch(endpoint, {
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

  if (hasActiveSubscription) {
    return (
      <div className="text-center">
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm font-medium">
          ✓ Weekly Featured Subscription Active
        </div>
        <p className="text-xs text-gray-600 mt-1">
          This book is automatically featured every week
        </p>
      </div>
    )
  }

  return (
    <div>
      {!showOptions ? (
        <button
          onClick={() => setShowOptions(true)}
          disabled={isLoading}
          className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          Feature This Book
        </button>
      ) : (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-2">Choose your option:</div>
          
          <button
            onClick={() => handleFeature(false)}
            disabled={isLoading}
            className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </span>
            ) : (
              <>
                <div className="font-semibold">One-Time Feature - $9.99</div>
                <div className="text-xs opacity-90">Feature for 7 days</div>
              </>
            )}
          </button>

          <button
            onClick={() => handleFeature(true)}
            disabled={isLoading}
            className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </span>
            ) : (
              <>
                <div className="font-semibold">Weekly Subscription - $19.99/month</div>
                <div className="text-xs opacity-90">Featured every week automatically</div>
              </>
            )}
          </button>

          <button
            onClick={() => setShowOptions(false)}
            className="text-gray-500 text-xs hover:text-gray-700 w-full"
          >
            Cancel
          </button>
        </div>
      )}
      
      {error && (
        <p className="text-red-600 text-xs mt-2">{error}</p>
      )}
    </div>
  )
} 