'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  tiktok_handle: string | null
  is_blocked: boolean
  blocked_reason: string | null
  blocked_at: string | null
  created_at: string
}

interface Book {
  id: string
  asin: string
  title: string | null
  author: string | null
  is_approved: boolean
  is_hidden: boolean
  moderation_notes: string | null
  created_at: string
  created_by: string
}

interface DashboardStats {
  type: string
  total_count: number
  blocked_count: number
  recent_count: number
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [stats, setStats] = useState<DashboardStats[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'books'>('overview')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || user.email !== 'glowleaf@gmail.com') {
        router.push('/')
        return
      }

      setUser(user)
      
      // Check if user has admin privileges in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error checking admin status:', userError)
        setError('Failed to check admin status')
        return
      }

      if (userData?.is_admin) {
        setIsAdmin(true)
        loadDashboardData()
      } else {
        // Set admin status for glowleaf@gmail.com if not already set
        try {
          await supabase.rpc('set_admin_status', {
            user_email: 'glowleaf@gmail.com',
            admin_status: true
          })
          setIsAdmin(true)
          loadDashboardData()
        } catch (rpcError) {
          console.error('Error setting admin status:', rpcError)
          setError('Failed to set admin status')
        }
      }
    } catch (error) {
      console.error('Admin access check failed:', error)
      setError('Admin access check failed')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardData = async () => {
    try {
      // Load stats using the new function
      const { data: statsData, error: statsError } = await supabase.rpc('get_admin_stats')
      
      if (statsError) {
        console.error('Error loading stats:', statsError)
      } else if (statsData) {
        setStats(statsData)
      }

      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (usersError) {
        console.error('Error loading users:', usersError)
      } else if (usersData) {
        setUsers(usersData)
      }

      // Load books
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (booksError) {
        console.error('Error loading books:', booksError)
      } else if (booksData) {
        setBooks(booksData)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setError('Failed to load dashboard data')
    }
  }

  const moderateUser = async (userId: string, block: boolean, reason?: string) => {
    try {
      const { error } = await supabase.rpc('moderate_user', {
        target_user_id: userId,
        block_status: block,
        reason: reason || null
      })
      
      if (error) {
        console.error('Error moderating user:', error)
        alert('Failed to moderate user: ' + error.message)
        return
      }
      
      loadDashboardData() // Refresh data
      alert(`User ${block ? 'blocked' : 'unblocked'} successfully`)
    } catch (error) {
      console.error('Failed to moderate user:', error)
      alert('Failed to moderate user')
    }
  }

  const moderateBook = async (bookId: string, approved?: boolean, hidden?: boolean, notes?: string) => {
    try {
      const { error } = await supabase.rpc('moderate_book', {
        book_id: bookId,
        approved,
        hidden,
        notes
      })
      
      if (error) {
        console.error('Error moderating book:', error)
        alert('Failed to moderate book: ' + error.message)
        return
      }
      
      loadDashboardData() // Refresh data
      alert('Book moderated successfully')
    } catch (error) {
      console.error('Failed to moderate book:', error)
      alert('Failed to moderate book')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
          >
            Back to Site
          </button>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have admin privileges.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.email}</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
            >
              Back to Site
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'users', name: 'Users' },
              { id: 'books', name: 'Books' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.length > 0 ? stats.map((stat) => (
              <div key={stat.type} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 capitalize mb-2">
                  {stat.type}
                </h3>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-gray-900">{stat.total_count}</p>
                  <p className="text-sm text-gray-600">
                    {stat.blocked_count} blocked/hidden
                  </p>
                  <p className="text-sm text-gray-600">
                    {stat.recent_count} this week
                  </p>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">Loading statistics...</p>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.tiktok_handle || 'No handle'}
                          </div>
                          <div className="text-sm text-gray-500">{user.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_blocked 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.is_blocked ? 'Blocked' : 'Active'}
                        </span>
                        {user.blocked_reason && (
                          <div className="text-xs text-gray-500 mt-1">
                            {user.blocked_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {user.is_blocked ? (
                          <button
                            onClick={() => moderateUser(user.id, false)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for blocking:')
                              if (reason) moderateUser(user.id, true, reason)
                            }}
                            className="text-red-600 hover:text-red-900 mr-4"
                          >
                            Block
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Books Tab */}
        {activeTab === 'books' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Book Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {book.title || 'Loading...'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {book.author} • ASIN: {book.asin}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            book.is_approved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {book.is_approved ? 'Approved' : 'Pending'}
                          </span>
                          {book.is_hidden && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Hidden
                            </span>
                          )}
                        </div>
                        {book.moderation_notes && (
                          <div className="text-xs text-gray-500 mt-1">
                            {book.moderation_notes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(book.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {!book.is_approved && (
                            <button
                              onClick={() => moderateBook(book.id, true)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const hidden = !book.is_hidden
                              const notes = hidden ? prompt('Reason for hiding:') : null
                              moderateBook(book.id, undefined, hidden, notes || undefined)
                            }}
                            className={book.is_hidden ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}
                          >
                            {book.is_hidden ? 'Unhide' : 'Hide'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 