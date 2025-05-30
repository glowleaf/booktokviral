'use client'

import { useState } from 'react'

export default function WeeklyResetPage() {
  const [isResetting, setIsResetting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all votes and save current winners? This cannot be undone!')) {
      return
    }

    setIsResetting(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/weekly-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Reset failed')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-600 to-yellow-500 mb-6">
            ⚠️ WEEKLY RESET ADMIN ⚠️
          </h1>
          <p className="text-2xl text-gray-700 font-bold mb-6">
            🚨 DANGER ZONE: Reset All Votes & Save Winners 🚨
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-red-200">
          <div className="bg-red-100 border-4 border-red-400 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-black text-red-800 mb-4">
              ⚠️ WARNING: This action will:
            </h2>
            <ul className="text-red-700 font-bold space-y-2">
              <li>• Save current top performers to Hall of Fame</li>
              <li>• DELETE ALL current votes from the database</li>
              <li>• Reset the weekly competition</li>
              <li>• This action CANNOT be undone!</li>
            </ul>
          </div>

          <div className="text-center mb-8">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className={`px-8 py-4 rounded-2xl text-xl font-black transition-all duration-300 ${
                isResetting
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-orange-600 text-white hover:scale-105 shadow-2xl'
              }`}
            >
              {isResetting ? '🔄 RESETTING...' : '💥 EXECUTE WEEKLY RESET'}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border-4 border-red-400 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-black text-red-800 mb-2">❌ Error:</h3>
              <p className="text-red-700 font-bold">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-100 border-4 border-green-400 rounded-xl p-6">
              <h3 className="text-xl font-black text-green-800 mb-4">✅ Reset Successful!</h3>
              <div className="text-green-700 font-bold space-y-2">
                <p>• Winners saved: {result.winnersSaved}</p>
                <p>• Week period: {new Date(result.weekStart).toLocaleDateString()} - {new Date(result.weekEnd).toLocaleDateString()}</p>
                <p>• All votes have been reset for the new week</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 underline font-bold text-lg"
          >
            ← Back to Homepage
          </a>
        </div>
      </div>
    </div>
  )
} 