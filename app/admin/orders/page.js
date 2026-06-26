'use client'

import { useState, useEffect } from 'react'
import { getServiceSupabase } from '@/lib/supabase'

const STATUSES = ['pending', 'paid', 'still packaging', 'sent to shipping', 'completed', 'cancelled']

export default function AdminOrdersPage() {
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    try {
      const supabase = await getServiceSupabase()
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, artworks(title))')
        .order('created_at', { ascending: false })
      if (error) throw error
      setItems(data || [])
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')
      setSuccess(`Order ${id.slice(0, 8)} → ${status}`)
      load()
    } catch (e) { setError(e.message) }
    setBusy(false)
  }

  const filtered = filter ? items.filter((o) => o.status === filter) : items

  return (
    <main className="main-content" style={{ paddingTop: 100 }}>
      <div className="container">
        <h2 style={{ marginBottom: 30 }}>Orders</h2>

        {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{error}</div>}
        {success && <div style={{ background: '#f0fdf4', color: '#166534', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{success}</div>}

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <strong style={{ fontSize: 13 }}>Filter:</strong>
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 12px', background: !filter ? 'var(--coffee)' : '', color: !filter ? '#fff' : '' }} onClick={() => setFilter('')}>All</button>
          {STATUSES.map((s) => (
            <button key={s} className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 12px', background: filter === s ? 'var(--coffee)' : '', color: filter === s ? '#fff' : '' }} onClick={() => setFilter(s)}>{s}</button>
          ))}
          <span style={{ fontSize: 12, color: 'var(--slate-gray)', marginLeft: 8 }}>{filtered.length} orders</span>
        </div>

        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Total</th><th>Artworks</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ padding: 20, textAlign: 'center', color: 'var(--slate-gray)', fontSize: 13 }}>No orders found</td></tr>
              )}
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontSize: 11, fontFamily: 'monospace' }}>{o.id.slice(0, 8)}</td>
                  <td>{o.customer_name}</td>
                  <td>{o.buyer_email}</td>
                  <td>{o.customer_phone}</td>
                  <td style={{ fontSize: 12 }}>
                    {[o.street_address, o.building_number, o.apartment_number, o.customer_city, o.customer_governorate].filter(Boolean).join(', ')}
                  </td>
                  <td>{o.total_items_cost ? `${o.total_items_cost} EGP` : '\u2014'}</td>
                  <td style={{ fontSize: 12 }}>
                    {(o.order_items || []).map((oi) => oi.artworks?.title).filter(Boolean).join(', ') || '\u2014'}
                  </td>
                  <td>
                    <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} disabled={busy}
                      style={{ padding: '4px 6px', borderRadius: 4, border: '1px solid var(--border)', fontSize: 12, background: '#fff', cursor: 'pointer' }}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                    {new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
