'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getBrowserSupabase, ADMIN_EMAIL } from '@/lib/supabase'

export default function AdminLayout({ children }) {
  const [checked, setChecked] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const check = async () => {
      const supabase = getBrowserSupabase()
      if (!supabase) { setChecked(true); setError('Supabase not configured'); return }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.email) {
        if (pathname !== '/admin/login') router.replace('/admin/login')
        setChecked(true)
        return
      }

      if (session.user.email !== ADMIN_EMAIL) {
        setError(`Access denied. Signed in as ${session.user.email}, expected admin email.`)
        setChecked(true)
        return
      }

      setAuthed(true)
      setChecked(true)
    }
    check()
  }, [pathname, router])

  if (pathname === '/admin/login' || pathname === '/admin/reset-password') return children

  if (!checked) return null

  if (error) {
    return (
      <main className="main-content" style={{ paddingTop: 100 }}>
        <div className="container">
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '20px 24px', borderRadius: 8, fontSize: 14, maxWidth: 500, margin: '0 auto' }}>
            <strong>Access Denied</strong>
            <p style={{ marginTop: 8 }}>{error}</p>
            <button onClick={() => router.push('/admin/login')} style={{ marginTop: 12, padding: '8px 20px', border: 'none', borderRadius: 6, background: 'var(--coffee)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              Go to Login
            </button>
          </div>
        </div>
      </main>
    )
  }

  return children
}
