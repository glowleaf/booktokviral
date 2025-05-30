'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    if (!email) {
      setMessage('Please enter your email address')
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setMessage(error.message)
        setIsSuccess(false)
      } else {
        setMessage('Check your email for the magic link!')
        setIsSuccess(true)
      }
    } catch {
      setMessage('An error occurred. Please try again.')
      setIsSuccess(false)
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSignIn} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-md ${
          isSuccess 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          required
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-pink-600 text-white py-3 px-4 rounded-md font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin mr-2">⏳</span>
            Sending magic link...
          </span>
        ) : (
          'Send Magic Link'
        )}
      </button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          We&apos;ll send you a secure link to sign in without a password.
        </p>
      </div>
    </form>
  )
} 