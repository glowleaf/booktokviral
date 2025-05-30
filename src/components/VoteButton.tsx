'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface VoteButtonProps {
  bookId: string
  initialVotes: number
}

export default function VoteButton({ bookId, initialVotes }: VoteButtonProps) {
  const [votes, setVotes] = useState(initialVotes)
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const router = useRouter()

  const handleVote = async () => {
    if (isVoting) return

    setIsVoting(true)
    const supabase = createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Redirect to sign in
      router.push('/auth/signin')
      setIsVoting(false)
      return
    }

    try {
      // Try to insert vote
      const { error } = await supabase
        .from('votes')
        .insert({ book_id: bookId, user_id: user.id })

      if (error) {
        if (error.code === '23505') {
          // User already voted
          setHasVoted(true)
        } else {
          console.error('Error voting:', error)
        }
      } else {
        // Vote successful
        setVotes(prev => prev + 1)
        setHasVoted(true)
      }
    } catch (error) {
      console.error('Error voting:', error)
    }

    setIsVoting(false)
  }

  return (
    <button
      onClick={handleVote}
      disabled={isVoting || hasVoted}
      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
        hasVoted
          ? 'bg-pink-100 text-pink-700 cursor-not-allowed'
          : 'bg-gray-100 text-gray-700 hover:bg-pink-100 hover:text-pink-700'
      }`}
    >
      <span className="text-lg">❤️</span>
      <span>{votes}</span>
      {isVoting && <span className="animate-spin">⏳</span>}
    </button>
  )
} 