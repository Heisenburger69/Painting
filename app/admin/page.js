'use client';

import { useState, useEffect, useCallback } from 'react';

const ADMIN_PASSWORD = 'admin123';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [paintings, setPaintings] = useState([]);
  const [tab, setTab] = useState('paintings');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [importText, setImportText] = useState('');
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    if (authenticated) loadPaintings();
  }, [authenticated]);

  async function loadPaintings() {
    try {
      const res = await fetch('/api/paintings');
      const data = await res.json();
      setPaintings(data.paintings || []);
    } catch (e) {
      console.error('Failed to load paintings', e);
    }
  }

  async function refreshJSON() {
    try {
      const res = await fetch('/api/paintings');
      const data = await res.json();
      setJsonText(JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Failed to load JSON', e);
    }
  }

  async function toggleSold(id) {
    const p = paintings.find((x) => x.id === id);
    if (!p) return;
    await fetch(`/api/paintings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sold: !p.sold, inStock: p.sold }),
    });
    await loadPaintings();
  }

  async function toggleFeatured(id) {
    const p = paintings.find((x) => x.id === id);
    if (!p) return;
    await fetch(`/api/paintings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !p.featured }),
    });
    await loadPaintings();
  }

  async function deletePainting(id) {
    if (!confirm('Delete this painting?')) return;
    await fetch(`/api/paintings/${id}`, { method: 'DELETE' });
    await loadPaintings();
  }

  function openEditor(painting) {
    if (painting) {
      setForm({
        id: painting.id,
        title: painting.title,
        medium: painting.medium,
        size: painting.size,
        year: painting.year,
        price: painting.price,
        currency: painting.currency,
        category: painting.category,
        sold: painting.sold,
        image: painting.image,
        images: ((painting.images || []).filter((i) => i !== painting.image)).join(', '),
        description: painting.description,
      });
      setEditing(painting.id);
    } else {
      setForm({
        id: '', title: '', medium: '', size: '', year: new Date().getFullYear(),
        price: '', currency: 'USD', category: 'Landscape', sold: false,
        image: '', images: '', description: '',
      });
      setEditing('new');
    }
  }

  async function savePainting() {
    if (!form.title.trim()) { alert('Title required'); return; }
    const mainImage = form.image.trim();
    const extraImages = form.images.split(',').map((s) => s.trim()).filter(Boolean);

    const data = {
      title: form.title,
      medium: form.medium || 'Oil on Canvas',
      size: form.size || 'Unknown',
      year: parseInt(form.year) || new Date().getFullYear(),
      price: parseFloat(form.price) || 0,
      currency: form.currency || 'USD',
      sold: form.sold,
      image: mainImage,
      images: [mainImage, ...extraImages].filter(Boolean),
      description: form.description || 'No description.',
      category: form.category,
      inStock: !form.sold,
    };

    if (editing && editing !== 'new') {
      data.featured = paintings.find((p) => p.id === editing)?.featured || false;
      await fetch(`/api/paintings/${editing}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/paintings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }

    setEditing(null);
    setForm(null);
    await loadPaintings();
  }

  async function copyJSON() {
    try {
      await navigator.clipboard.writeText(jsonText);
      alert('Copied!');
    } catch { /* fallback */ }
  }

  async function downloadJSON() {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paintings.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importJSON() {
    try {
      if (!importText.trim()) { alert('Paste JSON first.'); return; }
      const parsed = JSON.parse(importText);
      if (!parsed.paintings || !Array.isArray(parsed.paintings)) {
        throw new Error('Invalid JSON — must have "paintings" array');
      }
      await fetch('/api/paintings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import', json: importText }),
      });
      alert('Imported successfully!');
      setImportText('');
      await loadPaintings();
    } catch (e) {
      alert('Import failed: ' + e.message);
    }
  }

  async function handleReorder(fromIdx, toIdx) {
    if (fromIdx === toIdx) return;
    const arr = [...paintings];
    const [moved] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, moved);
    setPaintings(arr);
    setDragIndex(null);
  }

  const updateForm = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  if (!authenticated) {
    return (
      <div className="admin-login wrapper" style={{ maxWidth: 400, margin: '100px auto', padding: 40, background: 'var(--bg-white)', borderRadius: 12, boxShadow: 'var(--shadow-lg)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 30 }}>Admin Login</h2>
        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: 12, borderRadius: 6, marginBottom: 20 }}>{error}</div>}
        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" className="form-input" placeholder="Enter admin password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { if (password === ADMIN_PASSWORD) { setAuthenticated(true); setError(''); } else { setError('Incorrect password.'); } } }} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }}
          onClick={() => { if (password === ADMIN_PASSWORD) { setAuthenticated(true); setError(''); } else { setError('Incorrect password.'); } }}>
          Login
        </button>
      </div>
    );
  }

  const previewCard = form ? (
    <div className="preview-panel" style={{ background: 'var(--bg-white)', borderRadius: 12, padding: 24, marginTop: 20, boxShadow: 'var(--shadow-sm)', border: '2px solid #e0e0e0' }}>
      <h3 style={{ fontSize: 14, color: '#888', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Live Preview</h3>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        {form.image
          ? <img src={form.image} alt="" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8 }} onError={(e) => { e.target.style.display = 'none' }} />
          : <div style={{ width: 120, height: 90, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#999' }}>No Image</div>
        }
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{form.title || 'Untitled'}</div>
          <div style={{ fontSize: 13, color: 'var(--slate-gray)', fontStyle: 'italic' }}>{form.medium || 'Medium'}</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: form.sold ? 'var(--caput-mortuum)' : 'var(--coffee)', marginTop: 8 }}>
            {form.sold ? 'SOLD' : (form.currency || 'USD') + ' ' + (parseFloat(form.price) || 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="admin-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1>Admin Dashboard</h1>
        <button className="btn btn-secondary" onClick={() => setAuthenticated(false)}
          style={{ position: 'absolute', right: 20, padding: '8px 16px', fontSize: 12 }}>Logout</button>
      </div>

      <div className="wrapper" style={{ maxWidth: 1100, margin: '0 auto', padding: '30px 20px' }}>
        <div className="tabs" style={{ display: 'flex', gap: 4, marginBottom: 30, background: '#f0f0f0', borderRadius: 8, padding: 4, flexWrap: 'wrap' }}>
          {['paintings', 'json'].map((t) => (
            <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`}
              style={{ flex: 1, padding: '12px 16px', background: tab === t ? 'var(--bg-white)' : 'none', border: 'none', fontWeight: 600, cursor: 'pointer', borderRadius: 6, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, minWidth: 100, boxShadow: tab === t ? 'var(--shadow-sm)' : 'none', color: tab === t ? 'var(--tan)' : undefined }}
              onClick={() => { setTab(t); if (t === 'json') refreshJSON(); }}>{t}</button>
          ))}
        </div>

        {tab === 'paintings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h3 style={{ margin: 0 }}>All Paintings</h3>
              <button className="btn btn-primary" onClick={() => openEditor(null)} style={{ padding: '8px 20px', fontSize: 12 }}>+ New Painting</button>
            </div>

            {!editing && (
              <div>
                {paintings.length === 0 ? (
                  <p style={{ color: '#999', textAlign: 'center', padding: 40 }}>No paintings yet. Add one!</p>
                ) : (
                  paintings.map((p, i) => (
                    <div key={p.id} className="item-row"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'var(--bg-white)', borderRadius: 8, marginBottom: 8, boxShadow: 'var(--shadow-sm)', gap: 12, flexWrap: 'wrap', cursor: 'grab' }}
                      draggable="true"
                      onDragStart={() => setDragIndex(i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleReorder(dragIndex, i); }}
                    >
                      <div style={{ padding: '0 12px', color: '#999', fontSize: 18 }}>&#9776;</div>
                      <div className="item-info" style={{ flex: 1, minWidth: 200 }}>
                        <div className="item-title" style={{ fontWeight: 700, fontSize: 14 }}>
                          {p.featured ? '\u2726 ' : ''}{p.title}
                        </div>
                        <div className="item-meta" style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                          {p.medium} | {p.year} | {p.currency} {p.price} | <span className={p.sold ? 'status-sold' : 'status-available'}>{p.sold ? 'Sold' : 'Available'}</span>
                        </div>
                      </div>
                      <div className="item-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className={`sold-toggle${p.sold ? ' active' : ''}`}
                          style={{ padding: '6px 14px', border: '2px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: p.sold ? 'var(--caput-mortuum)' : 'var(--bg-white)', color: p.sold ? '#fff' : undefined, borderColor: p.sold ? 'var(--caput-mortuum)' : '#ddd' }}
                          onClick={() => toggleSold(p.id)}>{p.sold ? 'Sold' : 'Avail'}</button>
                        <button className={`btn-feature${p.featured ? ' active' : ''}`}
                          style={{ padding: '6px 10px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 16, background: p.featured ? 'var(--tan)' : 'rgba(212,167,106,0.15)', color: '#7a5f2e' }}
                          onClick={() => toggleFeatured(p.id)}>&#10022;</button>
                        <button className="btn-edit"
                          style={{ padding: '6px 14px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: 'rgba(212,167,106,0.2)', color: '#7a5f2e' }}
                          onClick={() => openEditor(p)}>Edit</button>
                        <button className="btn-delete"
                          style={{ padding: '6px 14px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: '#ffebee', color: '#c62828' }}
                          onClick={() => deletePainting(p.id)}>Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {editing && form && (
              <div className="form-section" style={{ background: 'var(--bg-white)', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid var(--tan)', fontSize: 16 }}>
                  {editing === 'new' ? 'New Painting' : 'Edit Painting'}
                </h3>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input type="text" className="form-input" value={form.title} onChange={(e) => updateForm('title', e.target.value)} placeholder="Painting title" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Medium</label>
                    <input type="text" className="form-input" value={form.medium} onChange={(e) => updateForm('medium', e.target.value)} placeholder="e.g. Oil on Canvas" />
                  </div>
                </div>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Size</label>
                    <input type="text" className="form-input" value={form.size} onChange={(e) => updateForm('size', e.target.value)} placeholder="e.g. 80 x 100 cm" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <input type="number" className="form-input" value={form.year} onChange={(e) => updateForm('year', e.target.value)} />
                  </div>
                </div>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Price</label>
                    <input type="number" className="form-input" value={form.price} onChange={(e) => updateForm('price', e.target.value)} placeholder="2400" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <input type="text" className="form-input" value={form.currency} onChange={(e) => updateForm('currency', e.target.value)} placeholder="USD" />
                  </div>
                </div>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={(e) => updateForm('category', e.target.value)}>
                      {['Landscape', 'Seascape', 'Portrait', 'Cityscape', 'Abstract', 'Figurative', 'Still Life'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sold</label>
                    <select className="form-select" value={form.sold ? 'true' : 'false'} onChange={(e) => updateForm('sold', e.target.value === 'true')}>
                      <option value="false">Available</option>
                      <option value="true">Sold</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Main Image Path</label>
                  <input type="text" className="form-input" value={form.image} onChange={(e) => updateForm('image', e.target.value)} placeholder="/assets/images/painting.jpg" />
                </div>
                <div className="form-group">
                  <label className="form-label">Additional Images (comma separated paths)</label>
                  <input type="text" className="form-input" value={form.images} onChange={(e) => updateForm('images', e.target.value)} placeholder="/assets/images/img1.jpg, /assets/images/img2.jpg" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" style={{ minHeight: 120 }} value={form.description} onChange={(e) => updateForm('description', e.target.value)} placeholder="Describe the painting..."></textarea>
                </div>

                {previewCard}

                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                  <button className="btn btn-primary" onClick={savePainting}>Save Painting</button>
                  <button className="btn btn-secondary" onClick={() => { setEditing(null); setForm(null); }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'json' && (
          <div>
            <div className="form-section" style={{ background: 'var(--bg-white)', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid var(--coffee)', fontSize: 16 }}>Paintings JSON</h3>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>Copy or download this JSON to save/export.</p>
              <div style={{ background: 'var(--space-cadet)', borderRadius: 12, padding: 20, position: 'relative' }}>
                <button className="json-copy-btn" onClick={copyJSON}
                  style={{ position: 'absolute', top: 12, right: 100, padding: '6px 16px', background: 'var(--tan)', color: 'var(--space-cadet)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Copy</button>
                <button onClick={downloadJSON}
                  style={{ position: 'absolute', top: 12, right: 12, padding: '6px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Download</button>
                <pre style={{ color: '#e0e0e0', fontSize: 12, lineHeight: 1.6, overflowX: 'auto', maxHeight: 400, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{jsonText}</pre>
              </div>
            </div>

            <div className="form-section" style={{ background: 'var(--bg-white)', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid var(--coffee)', fontSize: 16 }}>Import JSON</h3>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>Paste JSON here to load data.</p>
              <div style={{ border: '2px dashed #ddd', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                <textarea value={importText} onChange={(e) => setImportText(e.target.value)}
                  placeholder='Paste paintings JSON here...'
                  style={{ width: '100%', minHeight: 120, border: 'none', resize: 'vertical', fontFamily: 'monospace', fontSize: 12, outline: 'none', background: 'transparent' }} />
              </div>
              <button className="btn btn-primary" onClick={importJSON} style={{ marginTop: 10, padding: '8px 20px', fontSize: 12 }}>Import Paintings</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
