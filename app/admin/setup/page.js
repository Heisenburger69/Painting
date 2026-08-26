'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBrowserSupabase } from '@/lib/supabase'

function AdminSetupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [checkingToken, setCheckingToken] = useState(true)
  const [invite, setInvite] = useState(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    const checkToken = async () => {
      if (!token) { setCheckingToken(false); return }
      const supabase = getBrowserSupabase()
      if (!supabase) { setCheckingToken(false); return }

      const { data, error } = await supabase
        .from('admin_invites')
        .select('*')
        .eq('token', token)
        .maybeSingle()

      if (!error && data && !data.used_at && (!data.expires_at || new Date(data.expires_at) > new Date())) {
        setInvite(data)
      }
      setCheckingToken(false)
    }
    checkToken()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const supabase = getBrowserSupabase()
    if (!supabase) {
      setError('Supabase is not configured')
      setLoading(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    await supabase
      .from('admin_invites')
      .update({ used_at: new Date().toISOString(), claimed_email: email })
      .eq('token', token)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (!signInError) {
      router.push('/admin')
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (checkingToken) return null

  if (!invite) {
    return (
      <main className="main-content" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <div className="container">
          <div style={{ maxWidth: 440, margin: '0 auto', background: '#fff', padding: 32, borderRadius: 12, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
            <h1 style={{ fontSize: 20, fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--space-cadet)', marginBottom: 8 }}>
              Invite Link Invalid
            </h1>
            <p style={{ fontSize: 13, color: 'var(--slate-gray)' }}>
              This invite link is missing, has already been used, or has expired. Ask for a new link.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content" style={{ paddingTop: 100, paddingBottom: 100 }}>
      <div className="container">
        <div
          style={{
            maxWidth: 440,
            margin: '0 auto',
            background: '#fff',
            padding: 32,
            borderRadius: 12,
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)',
          }}
        >
          <h1
            style={{
              fontSize: 24,
              fontFamily: "'Playfair Display', Georgia, serif",
              color: 'var(--space-cadet)',
              marginBottom: 8,
            }}
          >
            Create Admin Account
          </h1>
          <p style={{ fontSize: 13, color: 'var(--slate-gray)', marginBottom: 24 }}>
            Set up your admin email and password to access the gallery dashboard.
          </p>

          {error && (
            <div
              style={{
                background: '#fef2f2',
                color: '#b91c1c',
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              {error}
            </div>
          )}

          {success ? (
            <div
              style={{
                background: '#f0fdf4',
                color: '#166534',
                padding: '16px',
                borderRadius: 8,
                fontSize: 14,
                textAlign: 'center',
              }}
            >
              <strong>Account created successfully!</strong>
              <p style={{ marginTop: 8, fontSize: 13 }}>
                If email confirmation is enabled in your Supabase project, please check your inbox to confirm your account.
              </p>
              <button
                onClick={() => router.push('/admin/login')}
                className="btn btn-primary"
                style={{ marginTop: 16, width: '100%' }}
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--space-cadet)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="artist@example.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--space-cadet)' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--space-cadet)' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter password"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    fontSize: 14,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
              >
                {loading ? 'Creating Account...' : 'Create Account & Log In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

export default function AdminSetupPage() {
  return (
    <Suspense fallback={null}>
      <AdminSetupForm />
    </Suspense>
  )
}
