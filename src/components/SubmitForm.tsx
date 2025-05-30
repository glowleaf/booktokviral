'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface BookDetails {
  title: string | null
  author: string | null
  cover_url: string | null
  asin: string
  error?: string
}

export default function SubmitForm() {
  const [asin, setAsin] = useState('')
  const [tiktokUrl, setTiktokUrl] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetchingDetails, setIsFetchingDetails] = useState(false)
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  const validateASIN = (asin: string) => {
    // ASIN is typically 10 characters, alphanumeric
    const asinRegex = /^[A-Z0-9]{10}$/
    return asinRegex.test(asin.toUpperCase())
  }

  // Auto-fetch book details when ASIN is entered
  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!asin || !validateASIN(asin)) {
        setBookDetails(null)
        return
      }

      setIsFetchingDetails(true)
      setError('')

      try {
        const response = await fetch('/api/fetch-book-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ asin: asin.toUpperCase() }),
        })

        const data = await response.json()

        if (response.ok) {
          setBookDetails(data)
          if (data.error) {
            setError(`Warning: ${data.error}`)
          }
        } else {
          setError(data.error || 'Failed to fetch book details')
          setBookDetails(null)
        }
      } catch (err) {
        console.error('Error fetching book details:', err)
        setError('Failed to fetch book details')
        setBookDetails(null)
      }

      setIsFetchingDetails(false)
    }

    // Debounce the API call
    const timeoutId = setTimeout(fetchBookDetails, 1000)
    return () => clearTimeout(timeoutId)
  }, [asin])

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

      // Include fetched book details if available
      if (bookDetails) {
        if (bookDetails.title) formData.append('title', bookDetails.title)
        if (bookDetails.author) formData.append('author', bookDetails.author)
        if (bookDetails.cover_url) formData.append('cover_url', bookDetails.cover_url)
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
        <div className={`border px-4 py-3 rounded ${
          error.startsWith('Warning:') 
            ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
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
        
        {isFetchingDetails && (
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <span className="animate-spin mr-2">⏳</span>
            Fetching book details...
          </div>
        )}
      </div>

      {/* Book Preview */}
      {bookDetails && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-3">📖 Book Preview</h4>
          <div className="flex items-start space-x-4">
            {bookDetails.cover_url && (
              <div className="relative w-16 h-24 flex-shrink-0">
                <Image
                  src={bookDetails.cover_url}
                  alt={bookDetails.title || 'Book cover'}
                  fill
                  className="object-cover rounded"
                  sizes="64px"
                />
              </div>
            )}
            <div className="flex-1">
              <h5 className="font-semibold text-gray-900">
                {bookDetails.title || 'Title not available'}
              </h5>
              {bookDetails.author && (
                <p className="text-gray-600 text-sm mt-1">by {bookDetails.author}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">ASIN: {bookDetails.asin}</p>
            </div>
          </div>
        </div>
      )}

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

      {/* TikTok Follow Suggestion */}
      <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
        <h4 className="font-medium text-pink-900 mb-2 flex items-center">
          🎵 Join Our BookTok Community!
        </h4>
        <p className="text-sm text-pink-800 mb-3">
          Follow us on TikTok for the latest book trends, featured submissions, and BookTok content!
        </p>
        <a
          href="https://www.tiktok.com/@booktokviralcom"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-pink-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-pink-700 transition-colors"
        >
          Follow @booktokviralcom →
        </a>
      </div>

      {/* Amazon Affiliate Disclosure */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">📚 Amazon Affiliate Program</h4>
        <p className="text-sm text-blue-800">
          BookTok Viral participates in the Amazon Associates Program. When you submit a book, 
          Amazon links will include our affiliate tag to help support the platform. This doesn't 
          affect the book price or your submission.
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
          </a>, understand that Amazon links will include affiliate tags, 
          and confirm that I have the right to submit this book. *
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isFetchingDetails}
        className="w-full bg-pink-600 text-white py-3 px-4 rounded-md font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin mr-2">⏳</span>
            Submitting...
          </span>
        ) : isFetchingDetails ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin mr-2">⏳</span>
            Loading book details...
          </span>
        ) : (
          'Submit Book'
        )}
      </button>
    </form>
  )
} 