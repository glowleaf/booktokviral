'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!supabase) return
    
    checkUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session?.user) {
        setUser(session.user)
        checkAdminStatus(session.user)
      } else {
        setUser(null)
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    if (!supabase) return
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      checkAdminStatus(user)
    }
  }

  const checkAdminStatus = async (user: User) => {
    if (user?.email === 'glowleaf@gmail.com') {
      setIsAdmin(true)
    }
  }

  const handleSignOut = async () => {
    if (!supabase) return
    
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-pink-600">
              📚 BookTok Viral
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/weekly" className="text-gray-700 hover:text-pink-600">
              Weekly Leaderboard
            </Link>
            <a 
              href="https://www.tiktok.com/@booktokviralcom" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-pink-600 flex items-center"
            >
              🎵 TikTok
            </a>
            {isAdmin && (
              <Link href="/admin" className="text-orange-600 hover:text-orange-700 font-medium">
                Admin
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  Welcome, {user.email?.split('@')[0]}!
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-pink-600 text-sm"
                >
                  Sign Out
                </button>
                <Link href="/submit" className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700">
                  Submit Book
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/signin" className="text-gray-700 hover:text-pink-600">
                  Sign In
                </Link>
                <Link href="/submit" className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700">
                  Submit Book
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 