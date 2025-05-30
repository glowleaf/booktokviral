'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SubmitForm() {
  const [asin, setAsin] = useState('')
  const [tiktokUrl, setTiktokUrl] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const validateASIN = (asin: string) => {
    // ASIN is typically 10 characters, alphanumeric
    const asinRegex = /^[A-Z0-9]{10}$/
    return asinRegex.test(asin.toUpperCase())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!asin.trim()) {
      setError('Please enter an Amazon ASIN')
      return
    }

    if (!validateASIN(asin)) {
      setError('Please enter a valid 10-character Amazon ASIN')
      return
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('asin', asin.toUpperCase())
      if (tiktokUrl.trim()) {
        formData.append('tiktok_url', tiktokUrl.trim())
      }

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        router.push('/success')
      } else {
        const errorText = await response.text()
        setError(errorText || 'Failed to submit book')
      }
    } catch {
      setError('An error occurred while submitting')
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="asin" className="block text-sm font-medium text-gray-700 mb-2">
          Amazon ASIN *
        </label>
        <input
          type="text"
          id="asin"
          value={asin}
          onChange={(e) => setAsin(e.target.value)}
          placeholder="e.g., B08XYZ1234"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          maxLength={10}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          10-character code from Amazon book page
        </p>
      </div>

      <div>
        <label htmlFor="tiktok_url" className="block text-sm font-medium text-gray-700 mb-2">
          TikTok URL (Optional)
        </label>
        <input
          type="url"
          id="tiktok_url"
          value={tiktokUrl}
          onChange={(e) => setTiktokUrl(e.target.value)}
          placeholder="https://www.tiktok.com/@username/video/..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Link to your BookTok video about this book
        </p>
      </div>

      <div className="flex items-start">
        <input
          type="checkbox"
          id="accept_terms"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
          required
        />
        <label htmlFor="accept_terms" className="ml-2 text-sm text-gray-700">
          I accept the{' '}
          <a href="/terms" className="text-pink-600 hover:text-pink-700 underline">
            terms and conditions
          </a>{' '}
          and confirm that I have the right to submit this book.
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-pink-600 text-white py-3 px-4 rounded-md font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin mr-2">⏳</span>
            Submitting...
          </span>
        ) : (
          'Submit Book'
        )}
      </button>
    </form>
  )
} 