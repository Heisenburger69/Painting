'use client'

import { useState, useEffect } from 'react'

const TABS = ['Artworks', 'Profile', 'Credentials', 'Exhibitions']

function api(path, options = {}) {
  return fetch(`/api/admin${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  }).then(async (r) => {
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || 'Request failed')
    return data
  })
}

export default function AdminPage() {
  const [tab, setTab] = useState('Artworks')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  return (
    <main className="main-content" style={{ paddingTop: 100 }}>
      <div className="container">
        <h2 style={{ marginBottom: 30 }}>Admin Dashboard</h2>

        {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{error}</div>}
        {success && <div style={{ background: '#f0fdf4', color: '#166534', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{success}</div>}

        <div style={{ display: 'flex', gap: 8, marginBottom: 30, flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(''); setSuccess('') }}
              style={{ padding: '8px 20px', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13, background: tab === t ? 'var(--coffee)' : 'transparent', color: tab === t ? '#fff' : 'var(--slate-gray)' }}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Artworks' && <ArtworksManager setError={setError} setSuccess={setSuccess} />}
        {tab === 'Profile' && <ProfileManager setError={setError} setSuccess={setSuccess} />}
        {tab === 'Credentials' && <CredentialsManager setError={setError} setSuccess={setSuccess} />}
        {tab === 'Exhibitions' && <ExhibitionsManager setError={setError} setSuccess={setSuccess} />}
      </div>
    </main>
  )
}

/* ─── Artworks ─── */
function ArtworksManager({ setError, setSuccess }) {
  const [items, setItems] = useState([])
  const [edit, setEdit] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try { setItems(await api('/artworks')) }
    catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const handleSave = async (form) => {
    setBusy(true); setError(''); setSuccess('')
    try {
      let artworkId = form.id
      if (!artworkId) {
        const created = await api('/artworks', { method: 'POST', body: JSON.stringify(form) })
        artworkId = created.id
      } else {
        await api(`/artworks/${artworkId}`, { method: 'PUT', body: JSON.stringify(form) })
      }

      if (form.file) {
        const fd = new FormData()
        fd.append('file', form.file)
        fd.append('artwork_id', artworkId)
        const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: fd }).then(r => r.json())
        if (uploadRes.error) throw new Error(uploadRes.error)
      }

      setSuccess('Saved'); setEdit(null); load()
    } catch (e) { setError(e.message) }
    setBusy(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Soft-delete this artwork?')) return
    setBusy(true)
    try { await api(`/artworks/${id}`, { method: 'DELETE' }); setSuccess('Deleted'); load() }
    catch (e) { setError(e.message) }
    setBusy(false)
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'artworks-export.json'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setEdit({})} disabled={busy}>+ New Artwork</button>
        <button className="btn btn-secondary" onClick={handleExport}>Export JSON</button>
      </div>

      {edit && <ArtworkForm item={edit} onSave={handleSave} onCancel={() => setEdit(null)} busy={busy} />}

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
            <th style={{ padding: 8 }}>Title</th><th style={{ padding: 8 }}>Year</th><th style={{ padding: 8 }}>Status</th><th style={{ padding: 8 }}>Price</th><th style={{ padding: 8 }}>Featured</th><th style={{ padding: 8 }}>Published</th><th style={{ padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: 8 }}>{a.title}</td>
              <td style={{ padding: 8 }}>{a.year}</td>
              <td style={{ padding: 8 }}>{a.status}</td>
              <td style={{ padding: 8 }}>{a.currency} {a.price?.toLocaleString()}</td>
              <td style={{ padding: 8 }}>{a.is_featured ? 'Yes' : ''}</td>
              <td style={{ padding: 8 }}>{a.is_published ? 'Yes' : ''}</td>
              <td style={{ padding: 8 }}>
                <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 12px', marginRight: 6 }} onClick={() => setEdit(a)}>Edit</button>
                <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 12px', background: 'var(--caput-mortuum)', color: '#fff' }} onClick={() => handleDelete(a.id)} disabled={busy}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ArtworkForm({ item, onSave, onCancel, busy }) {
  const [form, setForm] = useState({ id: item.id || null, title: item.title || '', year: item.year || '', medium: item.medium || '', width_cm: item.width_cm || '', height_cm: item.height_cm || '', depth_cm: item.depth_cm || '', description: item.description || '', price: item.price || '', currency: item.currency || 'EGP', status: item.status || 'available', is_featured: item.is_featured || false, is_published: item.is_published !== undefined ? item.is_published : true, sort_order: item.sort_order || 0, file: null })

  return (
    <div style={{ background: '#f9f9f9', padding: 20, borderRadius: 12, marginBottom: 20 }}>
      <h4 style={{ marginBottom: 16 }}>{form.id ? 'Edit Artwork' : 'New Artwork'}</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
        <input placeholder="Medium" value={form.medium} onChange={(e) => setForm({ ...form, medium: e.target.value })} />
        <input placeholder="Width (cm)" type="number" value={form.width_cm} onChange={(e) => setForm({ ...form, width_cm: e.target.value })} />
        <input placeholder="Height (cm)" type="number" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} />
        <input placeholder="Depth (cm)" type="number" value={form.depth_cm} onChange={(e) => setForm({ ...form, depth_cm: e.target.value })} />
        <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
          <option value="EGP">EGP</option><option value="USD">USD</option><option value="EUR">EUR</option>
        </select>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="available">Available</option><option value="reserved">Reserved</option><option value="sold">Sold</option><option value="not_for_sale">Not for Sale</option>
        </select>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <label><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured</label>
          <label><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Published</label>
        </div>
        <input placeholder="Sort Order" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
        <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} />
      </div>
      <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%', minHeight: 80, marginTop: 12 }} />
      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button className="btn btn-primary" onClick={() => onSave(form)} disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

/* ─── Profile ─── */
function ProfileManager({ setError, setSuccess }) {
  const [form, setForm] = useState({ name: '', artist_statement: '', research_academic: '', contact_email: '', contact_phone: '', instagram_url: '', tiktok_url: '' })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api('/profile').then((data) => { if (data && data.name) setForm(data) }).catch(() => {})
  }, [])

  const handleSave = async () => {
    setBusy(true); setError(''); setSuccess('')
    try { const data = await api('/profile', { method: 'PUT', body: JSON.stringify(form) }); if (data && data.id) setForm((prev) => ({ ...prev, id: data.id })); setSuccess('Profile updated') }
    catch (e) { setError(e.message) }
    setBusy(false)
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'grid', gap: 12 }}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <textarea placeholder="Artist Statement" value={form.artist_statement} onChange={(e) => setForm({ ...form, artist_statement: e.target.value })} style={{ minHeight: 120 }} />
        <textarea placeholder="Research & Academic" value={form.research_academic} onChange={(e) => setForm({ ...form, research_academic: e.target.value })} style={{ minHeight: 100 }} />
        <input placeholder="Contact Email" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
        <input placeholder="Contact Phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
        <input placeholder="Instagram URL" value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} />
        <input placeholder="TikTok URL" value={form.tiktok_url} onChange={(e) => setForm({ ...form, tiktok_url: e.target.value })} />
      </div>
      <button className="btn btn-primary" onClick={handleSave} disabled={busy} style={{ marginTop: 16 }}>{busy ? 'Saving...' : 'Save Profile'}</button>
    </div>
  )
}

/* ─── Credentials ─── */
function CredentialsManager({ setError, setSuccess }) {
  const [items, setItems] = useState([])
  const [edit, setEdit] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try { setItems(await api('/credentials')) }
    catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const handleSave = async (form) => {
    setBusy(true); setError(''); setSuccess('')
    try {
      if (form.id) await api(`/credentials/${form.id}`, { method: 'PUT', body: JSON.stringify(form) })
      else await api('/credentials', { method: 'POST', body: JSON.stringify(form) })
      setSuccess('Saved'); setEdit(null); load()
    } catch (e) { setError(e.message) }
    setBusy(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return
    try { await api(`/credentials/${id}`, { method: 'DELETE' }); setSuccess('Deleted'); load() }
    catch (e) { setError(e.message) }
  }

  return (
    <div>
      <button className="btn btn-primary" onClick={() => setEdit({})} style={{ marginBottom: 16 }}>+ New Credential</button>
      {edit && <InlineForm fields={['title', 'institution', 'type', 'start_year', 'end_year', 'description', 'sort_order']} item={edit} onSave={handleSave} onCancel={() => setEdit(null)} busy={busy} />}
      {items.map((c) => (
        <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <span><strong>{c.title}</strong>{c.institution ? ` — ${c.institution}` : ''} ({c.type})</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '2px 10px' }} onClick={() => setEdit(c)}>Edit</button>
            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '2px 10px', background: 'var(--caput-mortuum)', color: '#fff' }} onClick={() => handleDelete(c.id)}>Del</button>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Exhibitions ─── */
function ExhibitionsManager({ setError, setSuccess }) {
  const [items, setItems] = useState([])
  const [edit, setEdit] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try { setItems(await api('/exhibitions')) }
    catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const handleSave = async (form) => {
    setBusy(true); setError(''); setSuccess('')
    try {
      if (form.id) await api(`/exhibitions/${form.id}`, { method: 'PUT', body: JSON.stringify(form) })
      else await api('/exhibitions', { method: 'POST', body: JSON.stringify(form) })
      setSuccess('Saved'); setEdit(null); load()
    } catch (e) { setError(e.message) }
    setBusy(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return
    try { await api(`/exhibitions/${id}`, { method: 'DELETE' }); setSuccess('Deleted'); load() }
    catch (e) { setError(e.message) }
  }

  return (
    <div>
      <button className="btn btn-primary" onClick={() => setEdit({})} style={{ marginBottom: 16 }}>+ New Exhibition</button>
      {edit && <InlineForm fields={['title', 'venue', 'location', 'start_date', 'end_date', 'description', 'status']} item={edit} onSave={handleSave} onCancel={() => setEdit(null)} busy={busy} />}
      {items.map((ex) => (
        <div key={ex.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <span><strong>{ex.title}</strong> — {ex.venue} ({ex.status}, {ex.start_date})</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '2px 10px' }} onClick={() => setEdit(ex)}>Edit</button>
            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '2px 10px', background: 'var(--caput-mortuum)', color: '#fff' }} onClick={() => handleDelete(ex.id)}>Del</button>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Reusable inline form ─── */
function InlineForm({ fields, item, onSave, onCancel, busy }) {
  const [form, setForm] = useState(Object.fromEntries(fields.map((f) => [f, item[f] || ''])))

  return (
    <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 12, marginBottom: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {fields.map((f) => (
          f === 'description' ? <textarea key={f} placeholder={f} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} style={{ gridColumn: '1 / -1', minHeight: 60 }} />
            : f === 'status' ? <select key={f} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })}>
              {['past', 'upcoming', 'current'].map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            : <input key={f} placeholder={f} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button className="btn btn-primary" onClick={() => onSave(form)} disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
