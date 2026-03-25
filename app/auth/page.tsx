'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

type View = 'login' | 'signup' | 'forgot'

export default function AuthPage() {
  const [view, setView] = useState<View>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setName('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setForgotSent(false)
    setIsSubmitting(false)
  }

  const switchView = (next: View) => {
    resetForm()
    setView(next)
  }

  const handleGoogleLogin = () => {
    // TODO: add Google OAuth provider key and implement
  }

  const handleFacebookLogin = () => {
    // TODO: add Facebook OAuth provider key and implement
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: wire up Supabase auth
    // login:   supabase.auth.signInWithPassword({ email, password })
    // signup:  supabase.auth.signUp({ email, password, options: { data: { name } } })
    // forgot:  supabase.auth.resetPasswordForEmail(email)

    if (view === 'forgot') {
      setForgotSent(true)
    }

    setIsSubmitting(false)
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      {/* Background */}
      <Image
        src="/assets/landingpageBG.jpg"
        alt="Background"
        fill
        className="object-cover z-0"
        priority
      />
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Card */}
      <div className="relative z-20 w-full max-w-md">
        <div className="card-bg border border-white/10 rounded-2xl p-8 shadow-2xl">

          {/* Back to landing */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-6"
          >
            <ArrowLeft size={13} />
            Back to home
          </Link>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/assets/icon.png"
              alt="Logo"
              width={56}
              height={56}
              className="rounded-xl"
            />
          </div>

          {/* Header */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold brand-gradient-text mb-1">
              {view === 'login' && 'Hello Stranger'}
              {view === 'signup' && 'Create an account'}
              {view === 'forgot' && 'Reset your password'}
            </h1>
            <p className="text-sm muted-text">
              {view === 'login' && 'Sign in to share your unsaid thoughts.'}
              {view === 'signup' && 'Join and post anonymously on the map.'}
              {view === 'forgot' && 'Enter your email and we\'ll send a reset link.'}
            </p>
          </div>

          {/* Forgot password — success state */}
          {view === 'forgot' && forgotSent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#919191" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  <path d="m16 19 2 2 4-4" />
                </svg>
              </div>
              <p className="text-white font-medium mb-1">Check your inbox</p>
              <p className="text-sm muted-text mb-6">
                A reset link has been sent to <span className="text-gray-300">{email}</span>
              </p>
              <button
                onClick={() => switchView('login')}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Name — signup only */}
                {view === 'signup' && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                      Display name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="What should we call you?"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25 transition-colors"
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25 transition-colors"
                  />
                </div>

                {/* Password — login and signup only */}
                {view !== 'forgot' && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm password — signup only */}
                {view === 'signup' && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Forgot password link — login only */}
                {view === 'login' && (
                  <div className="flex justify-end -mt-1">
                    <button
                      type="button"
                      onClick={() => switchView('forgot')}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="brand-button w-full py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:opacity-90 mt-2"
                >
                  {isSubmitting
                    ? 'Please wait...'
                    : view === 'login'
                    ? 'Sign in'
                    : view === 'signup'
                    ? 'Create account'
                    : 'Send reset link'}
                </button>
              </form>

              {/* OAuth buttons — only on login and signup */}
              {view !== 'forgot' && (
                <div className="space-y-3 mt-4">
                  {/* Divider */}
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-gray-600">or continue with</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-medium transition-all duration-200"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>

                  <button
                    onClick={handleFacebookLogin}
                    type="button"
                    className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-medium transition-all duration-200"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Continue with Facebook
                  </button>

                  <Link
                    href="/wall"
                    className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-400 hover:text-white font-medium transition-all duration-200"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Continue as Guest
                  </Link>
                </div>
              )}

              {/* Footer switch */}
              <p className="mt-6 text-center text-xs text-gray-600">
                {view === 'login' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button
                      onClick={() => switchView('signup')}
                      className="text-gray-400 hover:text-white transition-colors font-medium"
                    >
                      Sign up
                    </button>
                  </>
                ) : view === 'signup' ? (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => switchView('login')}
                      className="text-gray-400 hover:text-white transition-colors font-medium"
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Remember it?{' '}
                    <button
                      onClick={() => switchView('login')}
                      className="text-gray-400 hover:text-white transition-colors font-medium"
                    >
                      Back to sign in
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
