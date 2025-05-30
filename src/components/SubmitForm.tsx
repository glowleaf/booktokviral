'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type AuthMode = 'signin' | 'signup' | 'magic'

export default function SubmitForm() {
  const [asinInput, setAsinInput] = useState('')
  const [tiktokUrl, setTiktokUrl] = useState('')
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
      /\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i,
      // ASIN in query parameters
      /[?&]ASIN=([A-Z0-9]{10})/i,
      // Product ID in various formats
      /\/product\/([A-Z0-9]{10})/i,
      // Direct ASIN pattern
      /([A-Z0-9]{10})/i
    ]
    
    for (const pattern of asinPatterns) {
      const match = cleanInput.match(pattern)
      if (match && match[1]) {
        return match[1].toUpperCase()
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

    if (!acceptTerms) {
      setError('Please accept the terms and conditions')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('asin', finalAsin.toUpperCase())
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