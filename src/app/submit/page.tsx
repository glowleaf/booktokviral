import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SubmitForm from '@/components/SubmitForm'

export default async function SubmitPage() {
  const supabase = await createServerSupabaseClient()
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Submit a Book
            </h1>
            <p className="text-gray-600">
              Share your favorite book with the BookTok community! 
              Just provide the Amazon ASIN and we&apos;ll fetch all the details.
            </p>
          </div>

          <SubmitForm />

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How to find an Amazon ASIN:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Go to the book&apos;s Amazon page</li>
              <li>2. Look in the URL for a 10-character code (e.g., B08XYZ1234)</li>
              <li>3. Or scroll down to &quot;Product details&quot; and find the ASIN</li>
            </ol>
            <p className="text-xs text-blue-700 mt-2">
              Example: amazon.com/dp/<strong>B08XYZ1234</strong> → ASIN is B08XYZ1234
            </p>
          </div>

          <div className="mt-6 p-4 bg-pink-50 rounded-lg">
            <h3 className="font-semibold text-pink-900 mb-2">💎 Want to feature your book?</h3>
            <p className="text-sm text-pink-800 mb-3">
              After submitting your book, you can feature it at the top of the homepage to get more visibility and votes!
            </p>
            <div className="space-y-2 text-xs text-pink-700">
              <div className="flex items-center justify-between bg-white p-2 rounded">
                <span><strong>One-time Feature:</strong> $9.99 for 7 days</span>
                <span className="text-yellow-600">⭐</span>
              </div>
              <div className="flex items-center justify-between bg-white p-2 rounded">
                <span><strong>Weekly Subscription:</strong> $19.99/month</span>
                <span className="text-purple-600">🔄</span>
              </div>
            </div>
            <p className="text-xs text-pink-700 mt-2">
              Visit your book&apos;s page after submission to choose your featuring option
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 