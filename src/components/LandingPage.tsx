import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Heart, Camera, Users, Calendar, Sparkles, Send } from 'lucide-react'

export function LandingPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await signIn(email)
      setMessage('Check your email for the magic link!')
      setEmail('')
    } catch {
      setMessage('Error sending magic link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-pink-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Dream Wedding Day</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Perfect Wedding
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                Starts Here
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create unforgettable memories with AI-powered photo analysis, seamless RSVP management, 
              and real-time coordination tools. Let us help you plan the wedding of your dreams.
            </p>
            
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSignIn} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" /> Get Started</>
                  )}
                </Button>
              </form>
              {message && (
                <p className="mt-3 text-sm text-green-600">{message}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Your Special Day
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From planning to execution, we've got you covered with intelligent tools and seamless coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6 mb-4 group-hover:scale-105 transition-transform">
                <Camera className="h-12 w-12 text-blue-600 mx-auto" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Photo Analysis</h4>
              <p className="text-gray-600 text-sm">
                Automatically organize and analyze photos with AI to capture every precious moment.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6 mb-4 group-hover:scale-105 transition-transform">
                <Users className="h-12 w-12 text-green-600 mx-auto" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Smart RSVP</h4>
              <p className="text-gray-600 text-sm">
                Effortlessly manage guest lists and track responses with our intelligent RSVP system.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-6 mb-4 group-hover:scale-105 transition-transform">
                <Calendar className="h-12 w-12 text-purple-600 mx-auto" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Timeline Management</h4>
              <p className="text-gray-600 text-sm">
                Keep everything on schedule with real-time timeline updates and vendor coordination.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl p-6 mb-4 group-hover:scale-105 transition-transform">
                <Sparkles className="h-12 w-12 text-pink-600 mx-auto" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h4>
              <p className="text-gray-600 text-sm">
                Stay connected with guests and vendors through instant messaging and notifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Start Planning?
          </h3>
          <p className="text-xl text-pink-100 mb-8">
            Join thousands of couples who have created their perfect wedding day with us.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="bg-white text-purple-600 hover:bg-gray-50 border-0"
            onClick={() => document.querySelector('input[type="email"]')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-pink-500 mr-2" />
              <span className="text-xl font-bold">Dream Wedding Day</span>
            </div>
            <p className="text-gray-400 mb-4">
              Making your dream wedding a reality, one moment at a time.
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 Dream Wedding Day. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}