'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

type AuthMode = 'signin' | 'signup' | 'magic'

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const supabase = createClient()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      setMessage('Authentication service unavailable')
      return
    }

    setIsLoading(true)
    setMessage('')

    if (!email) {
      setMessage('Please enter your email address')
      setIsLoading(false)
      return
    }

    try {
      if (mode === 'magic') {
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
      } else {
        if (!password) {
          setMessage('Please enter your password')
          setIsLoading(false)
          return
        }

        if (mode === 'signup') {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) {
            setMessage(error.message)
            setIsSuccess(false)
          } else {
            setMessage('Check your email to confirm your account!')
            setIsSuccess(true)
          }
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            setMessage(error.message)
            setIsSuccess(false)
          } else {
            setMessage('Successfully signed in!')
            setIsSuccess(true)
            // Redirect will happen automatically
            window.location.href = '/'
          }
        }
      }
    } catch (err) {
      setMessage('An error occurred. Please try again.')
      setIsSuccess(false)
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Auth Mode Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setMode('signin')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            mode === 'signin'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setMode('signup')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            mode === 'signup'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sign Up
        </button>
        <button
          onClick={() => setMode('magic')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            mode === 'magic'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Magic Link
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-md ${
          isSuccess 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Email/Password Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
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

        {mode !== 'magic' && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-pink-600 text-white py-3 px-4 rounded-md font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">⏳</span>
              {mode === 'magic' ? 'Sending magic link...' : 
               mode === 'signup' ? 'Creating account...' : 'Signing in...'}
            </span>
          ) : (
            mode === 'magic' ? 'Send Magic Link' :
            mode === 'signup' ? 'Create Account' : 'Sign In'
          )}
        </button>
      </form>

      {mode !== 'magic' && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>
      )}

      {mode === 'magic' && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            We&apos;ll send you a secure link to sign in without a password.
          </p>
        </div>
      )}
    </div>
  )
} 