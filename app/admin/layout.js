'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getBrowserSupabase } from '@/lib/supabase'

export default function AdminLayout({ children }) {
  const [checked, setChecked] = useState(false)
  const [authed, setAuthed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const check = async () => {
      const supabase = getBrowserSupabase()
      if (!supabase) { setChecked(true); return }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session && pathname !== '/admin/login') {
        router.replace('/admin/login')
      } else {
        setAuthed(!!session)
      }
      setChecked(true)
    }
    check()
  }, [pathname, router])

  if (pathname === '/admin/login') return children

  if (!checked) return null

  return children
}
