import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { ApiError } from '../lib/api'

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    navigate('/')
    return null
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (username.length < 2 || username.length > 30) {
      next.username = 'Username must be 2–30 characters'
    } else if (!USERNAME_REGEX.test(username)) {
      next.username = 'Only letters, numbers, and underscores'
    }
    if (!email.trim()) {
      next.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Enter a valid email'
    }
    if (password.length < 6) {
      next.password = 'Password must be at least 6 characters'
    }
    if (displayName.length > 50) {
      next.displayName = 'Display name must be 50 characters or less'
    }
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    if (!validate()) return
    setLoading(true)
    try {
      await register({ username, email, password, displayName: displayName || undefined })
      showToast('Account created. Welcome to AceVerse!', 'success')
      navigate('/')
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        const flat: Record<string, string> = {}
        for (const [k, v] of Object.entries(err.fieldErrors)) {
          if (Array.isArray(v) && v[0]) flat[k] = v[0]
        }
        setFieldErrors(flat)
        setError(err.message)
      } else {
        const message = err instanceof Error ? err.message : 'Registration failed'
        setError(message)
        showToast(message, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4">
      <div className="max-w-md w-full space-y-8 p-8 rounded-xl bg-secondary border border-border-default">
        <div>
          <h2 className="text-3xl font-bold text-center text-primary">
            Join AceVerse
          </h2>
          <p className="mt-1 text-center text-sm text-secondary">
            Your gaming universe. One feed.
          </p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-950/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-secondary">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              minLength={2}
              maxLength={30}
              value={username}
              onChange={(e) => { setUsername(e.target.value); setFieldErrors((p) => { const next = { ...p }; delete next.username; return next; }) }}
              className="mt-1 block w-full px-3 py-2 border border-border-default rounded-lg bg-tertiary text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="gamer_123"
            />
            {fieldErrors.username && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.username}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => { const next = { ...p }; delete next.email; return next; }) }}
              className="mt-1 block w-full px-3 py-2 border border-border-default rounded-lg bg-tertiary text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-secondary">
              Display name (optional)
            </label>
            <input
              id="displayName"
              type="text"
              maxLength={50}
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setFieldErrors((p) => { const next = { ...p }; delete next.displayName; return next; }) }}
              className="mt-1 block w-full px-3 py-2 border border-border-default rounded-lg bg-tertiary text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Your display name"
            />
            {fieldErrors.displayName && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.displayName}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => { const next = { ...p }; delete next.password; return next; }) }}
              className="mt-1 block w-full px-3 py-2 border border-border-default rounded-lg bg-tertiary text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="At least 6 characters"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.password}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
          <p className="text-center text-sm text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
