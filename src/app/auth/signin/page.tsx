import AuthForm from '@/components/AuthForm'

// Force dynamic rendering to prevent build-time Supabase initialization
export const dynamic = 'force-dynamic'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to BookTok Viral
            </h1>
            <p className="text-gray-600">
              Sign in to submit books and vote for your favorites!
            </p>
          </div>

          <AuthForm />

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-pink-600 hover:text-pink-700 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-pink-600 hover:text-pink-700 underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 