'use client'

import { useState, useEffect } from 'react'

interface VoteButtonProps {
  bookId: string
  initialVotes: number
}

export default function VoteButton({ bookId, initialVotes }: VoteButtonProps) {
  const [votes, setVotes] = useState(initialVotes)
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user has already voted when component mounts
  useEffect(() => {
    const checkVoteStatus = async () => {
      try {
        const response = await fetch(`/api/check-vote?bookId=${bookId}`)
        const data = await response.json()
        setHasVoted(data.hasVoted)
      } catch (error) {
        console.error('Error checking vote status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkVoteStatus()
  }, [bookId])

  const handleVote = async () => {
    if (isVoting || hasVoted) return

    setIsVoting(true)

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookId }),
      })

      const data = await response.json()

      if (response.ok) {
        // Vote successful
        setVotes(data.voteCount)
        setHasVoted(true)
      } else if (response.status === 409) {
        // Already voted
        setHasVoted(true)
      } else {
        console.error('Error voting:', data.error)
      }
    } catch (error) {
      console.error('Error voting:', error)
    }

    setIsVoting(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
        <span className="text-lg">❤️</span>
        <span>{votes}</span>
        <span className="animate-spin">⏳</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleVote}
      disabled={isVoting || hasVoted}
      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
        hasVoted
          ? 'bg-pink-100 text-pink-700 cursor-not-allowed'
          : 'bg-gray-100 text-gray-700 hover:bg-pink-100 hover:text-pink-700 hover:scale-105 transform transition-all duration-200'
      }`}
      title={hasVoted ? 'You already voted for this book' : 'Vote for this book'}
    >
      <span className="text-lg">{hasVoted ? '💖' : '❤️'}</span>
      <span>{votes}</span>
      {isVoting && <span className="animate-spin">⏳</span>}
      {hasVoted && <span className="text-xs">✓</span>}
    </button>
  )
} 