'use client'

import { useState } from 'react'

export default function UpdateBooksPage() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [result, setResult] = useState('')

  const updateBooks = async () => {
    setIsUpdating(true)
    setResult('')
    
    try {
      const response = await fetch('/api/fetch-book-details', {
        method: 'GET'
      })
      
      if (response.ok) {
        const data = await response.json()
        setResult(`✅ ${data.message}`)
      } else {
        setResult('❌ Failed to update books')
      }
    } catch (error) {
      setResult('❌ Error updating books')
      console.error('Error:', error)
    }
    
    setIsUpdating(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-yellow-500 mb-6">
            🔧 ADMIN: UPDATE BOOKS 🔧
          </h1>
          
          <p className="text-lg text-gray-700 mb-8">
            This will fetch titles and covers for books that don't have them yet.
          </p>
          
          <button
            onClick={updateBooks}
            disabled={isUpdating}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl text-xl font-black hover:scale-105 transform transition-all duration-300 shadow-2xl border-4 border-white disabled:opacity-50 disabled:hover:scale-100"
          >
            {isUpdating ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-3 text-2xl">⏳</span>
                <span>UPDATING BOOKS...</span>
              </span>
            ) : (
              '🚀 UPDATE BOOK DETAILS 🚀'
            )}
          </button>
          
          {result && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <p className="text-lg font-semibold">{result}</p>
            </div>
          )}
          
          <div className="mt-8">
            <a
              href="/"
              className="text-pink-600 hover:text-pink-700 underline font-semibold"
            >
              ← Back to Homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 