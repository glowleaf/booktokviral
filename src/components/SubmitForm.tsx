'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type AuthMode = 'signin' | 'signup' | 'magic'

const BOOK_CATEGORIES = [
  'Fantasy',
  'Romance',
  'Mystery',
  'Thriller',
  'Young Adult',
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Historical Fiction',
  'Self-Help',
  'Biography',
  'Horror',
  'Poetry',
  'Humor',
  'Other'
]

export default function SubmitForm() {
  const [asinInput, setAsinInput] = useState('')
  const [tiktokUrl, setTiktokUrl] = useState('')
  const [category, setCategory] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [extractedAsin, setExtractedAsin] = useState('')
  const router = useRouter()

  const extractASINFromURL = (input: string): string | null => {
    // Remove whitespace
    const cleanInput = input.trim()
    
    // If it's already a 10-character ASIN, return it
    if (/^[A-Z0-9]{10}$/i.test(cleanInput)) {
      return cleanInput.toUpperCase()
    }
    
    // Extract ASIN from various Amazon URL formats
    const asinPatterns = [
      // Standard product URLs: /dp/ASIN or /gp/product/ASIN
      /\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[\/\?]|$)/i,
      // ASIN in query parameters
      /[?&]ASIN=([A-Z0-9]{10})(?:&|$)/i,
      // Product ID in various formats
      /\/product\/([A-Z0-9]{10})(?:[\/\?]|$)/i,
    ]
    
    for (const pattern of asinPatterns) {
      const match = cleanInput.match(pattern)
      if (match && match[1]) {
        // Verify it's a valid ASIN format
        const potentialAsin = match[1].toUpperCase()
        if (/^[A-Z0-9]{10}$/.test(potentialAsin)) {
          return potentialAsin
        }
      }
    }
    
    return null
  }

  const handleInputChange = (value: string) => {
    setAsinInput(value)
    setError('')
    
    if (value.trim()) {
      const asin = extractASINFromURL(value)
      if (asin) {
        setExtractedAsin(asin)
      } else {
        setExtractedAsin('')
        if (value.includes('amazon.') || value.includes('amzn.')) {
          setError('Could not extract ASIN from this Amazon URL. Please check the link or enter the ASIN directly.')
        }
      }
    } else {
      setExtractedAsin('')
    }
  }

  const validateASIN = (asin: string) => {
    // ASIN is typically 10 characters, alphanumeric
    const asinRegex = /^[A-Z0-9]{10}$/
    return asinRegex.test(asin.toUpperCase())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const finalAsin = extractedAsin || asinInput.trim()

    if (!finalAsin) {
      setError('Please enter an Amazon ASIN or Amazon product URL')
      return
    }

    if (!validateASIN(finalAsin)) {
      setError('Please enter a valid Amazon URL or 10-character ASIN')
      return
    }

    if (!category) {
      setError('Please select a category')
      return
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('asin', finalAsin.toUpperCase())
      formData.append('category', category)
      if (tiktokUrl.trim()) {
        formData.append('tiktok_url', tiktokUrl.trim())
      }

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.bookId) {
          router.push(`/success?bookId=${result.bookId}`)
        } else {
          router.push('/success')
        }
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
          Amazon Product URL or ASIN *
        </label>
        <input
          type="text"
          id="asin"
          value={asinInput}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="https://www.amazon.com/dp/B08XYZ1234 or B08XYZ1234"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Paste the full Amazon product URL or enter the 10-character ASIN directly
        </p>
        
        {extractedAsin && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
            <span className="text-green-700">✓ ASIN detected: </span>
            <span className="font-mono font-semibold text-green-800">{extractedAsin}</span>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Book Category *
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          required
        >
          <option value="">Select a category</option>
          {BOOK_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Choose the category that best fits this book
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

      {/* TikTok Follow Suggestion */}
      <div className="p-6 bg-gradient-to-r from-black via-gray-800 to-black rounded-2xl border-4 border-pink-400 shadow-2xl">
        <h4 className="text-2xl font-black text-white mb-3 flex items-center justify-center">
          🎵 JOIN OUR VIRAL BOOKTOK COMMUNITY! 🎵
        </h4>
        <p className="text-lg text-gray-300 font-bold mb-4 text-center">
          🔥 Follow us for the HOTTEST book trends, featured submissions, and VIRAL BookTok content! 🔥
        </p>
        <div className="text-center">
          <a
            href="https://www.tiktok.com/@booktokviralcom"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:scale-110 transform transition-all duration-300 shadow-xl border-4 border-white"
          >
            🚀 FOLLOW @booktokviralcom NOW! 🚀
          </a>
        </div>
      </div>

      {/* Amazon Affiliate Disclosure */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">📚 Amazon Affiliate Program</h4>
        <p className="text-sm text-blue-800">
          BookTok Viral participates in the Amazon Associates Program. When you submit a book, 
          Amazon links will include our affiliate tag to help support the platform. This doesn&apos;t 
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
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-2xl text-xl font-black hover:scale-105 transform transition-all duration-300 shadow-2xl border-4 border-white focus:outline-none focus:ring-4 focus:ring-pink-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin mr-3 text-2xl">⏳</span>
            <span>SUBMITTING VIRAL BOOK...</span>
          </span>
        ) : (
          '🚀 SUBMIT VIRAL BOOK NOW! 🚀'
        )}
      </button>
    </form>
  )
} 