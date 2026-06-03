import Link from 'next/link'
import { getArtistProfile, getCredentials, getPastExhibitions, getUpcomingExhibitions, getArtworks, getFeaturedArtworks } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [profile, credentials, pastExhibitions, upcomingExhibitions, artworks, featuredList] = await Promise.all([
    getArtistProfile(), getCredentials(), getPastExhibitions(), getUpcomingExhibitions(), getArtworks(), getFeaturedArtworks(),
  ])

  const featured = featuredList.length > 0 ? featuredList[0] : artworks[0]

  return (
    <>
      {/* HERO */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h1>Atelier</h1>
          <p>Original paintings — where light meets pigment, and every canvas tells a story</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <a href="#gallery" className="btn btn-primary">Browse Gallery</a>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="section">
        <div className="container">
          <div className="section-header"><h2>Available Works</h2></div>
          {artworks.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--slate-gray)', padding: 60 }}>No artworks yet — check back soon.</p>
          ) : (
            <div className="paintings-grid">
              {artworks.map((a) => (
                <Link key={a.id} href={`/painting/${a.id}`} className={`painting-card${a.featured ? ' featured' : ''}`}>
                  <div className="card-image">
                    {a.image ? <img src={a.image} alt={a.title} /> : <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 12 }}>No Image</div>}
                  </div>
                  <div className="card-title">{a.title}</div>
                  <div className="card-medium">{a.medium} — {a.year}</div>
                  <p className="card-excerpt">{a.description ? (a.description.slice(0, 120) + (a.description.length > 120 ? '...' : '')) : ''}</p>
                  <div className={`card-price${a.sold ? ' sold' : ''}`}>
                    {a.sold ? 'SOLD' : `${a.currency} ${(a.price || 0).toLocaleString()}`}
                    {a.sold && <span className="sold-badge">Sold</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ARTIST STATEMENT */}
      <section id="statement" className="section-dark">
        <div className="container">
          <div className="section-header"><h2>Artist Statement</h2></div>
          <div className="info-card-dark" style={{ maxWidth: 900, margin: '0 auto' }}>
            {profile?.artist_statement ? (
              profile.artist_statement.split('\n').filter(Boolean).map((p, i) => (
                <p key={i} style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 20 }}>{p}</p>
              ))
            ) : (
              <p style={{ fontSize: 16, lineHeight: 1.9, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                Artist statement coming soon.
              </p>
            )}
            {profile?.name && (
              <div style={{ textAlign: 'right', marginTop: 30, fontStyle: 'italic', color: 'var(--tan)' }}>
                — {profile.name}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* BIOGRAPHY */}
      <section id="biography" className="section">
        <div className="container">
          <div className="section-header"><h2>Biography</h2></div>
          {credentials.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--slate-gray)', padding: 40 }}>Biography details coming soon.</p>
          ) : (
            <div className="grid grid-2" style={{ gap: 40, alignItems: 'start' }}>
              {['education', 'certificate', 'work'].map((type) => {
                const items = credentials.filter((c) => c.type === type)
                if (items.length === 0) return null
                const label = type === 'education' ? 'Education & Training' : type === 'certificate' ? 'Certificates' : 'Professional Experience'
                return (
                  <div className="info-card" key={type}>
                    <h3 style={{ marginBottom: 16, fontSize: 14, color: 'var(--slate-gray)' }}>{label}</h3>
                    <ul className="info-list">
                      {items.map((c) => (
                        <li key={c.id}>
                          <strong>{c.title}</strong>
                          {c.institution ? ` — ${c.institution}` : ''}
                          {c.start_year ? ` (${c.start_year}${c.end_year ? `–${c.end_year}` : ''})` : ''}
                          {c.description ? <br /> : ''}
                          {c.description ? <span style={{ fontSize: 13, color: 'var(--slate-gray)' }}>{c.description}</span> : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* EXHIBITIONS (Past) */}
      <section id="exhibitions" className="section-dark">
        <div className="container">
          <div className="section-header"><h2>Exhibitions</h2></div>
          {pastExhibitions.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: 40 }}>No past exhibitions yet.</p>
          ) : (
            <div className="grid grid-2" style={{ gap: 30, maxWidth: 1000, margin: '0 auto' }}>
              {pastExhibitions.map((ex) => {
                const year = ex.start_date ? new Date(ex.start_date).getFullYear() : ''
                return (
                  <div className="info-card-dark" key={ex.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <h3 style={{ margin: 0, fontSize: 16 }}>{ex.title}</h3>
                      {year && <span style={{ color: 'var(--tan)', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{year}</span>}
                    </div>
                    <p style={{ fontSize: 13, marginBottom: 8 }}>{[ex.venue, ex.location].filter(Boolean).join(', ')}</p>
                    {ex.description && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{ex.description}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* RESEARCH & ACADEMIC */}
      <section id="research" className="section">
        <div className="container">
          <div className="section-header"><h2>Research & Academic Work</h2></div>
          {profile?.research_academic ? (
            <div className="info-card" style={{ maxWidth: 900, margin: '0 auto' }}>
              {profile.research_academic.split('\n').filter(Boolean).map((p, i) => (
                <p key={i} style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>{p}</p>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--slate-gray)', padding: 40 }}>Research & academic work coming soon.</p>
          )}
        </div>
      </section>

      {/* NEWS & EVENTS (Upcoming) */}
      <section id="news" className="section-dark">
        <div className="container">
          <div className="section-header"><h2>News & Events</h2></div>
          {upcomingExhibitions.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: 40 }}>No upcoming events at this time.</p>
          ) : (
            <div className="grid grid-2" style={{ gap: 30, maxWidth: 1000, margin: '0 auto' }}>
              {upcomingExhibitions.map((ex) => {
                const badgeColor = ex.status === 'upcoming' ? 'var(--tan)' : ex.status === 'current' ? 'var(--coffee)' : 'var(--space-cadet)'
                const badgeText = ex.status === 'upcoming' ? 'Upcoming' : ex.status === 'current' ? 'Current' : 'Event'
                return (
                  <div className="info-card-dark" key={ex.id}>
                    <span style={{ display: 'inline-block', background: badgeColor, color: badgeColor === 'var(--space-cadet)' ? 'var(--tan)' : badgeColor === 'var(--coffee)' ? '#fff' : 'var(--space-cadet)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4, marginBottom: 12 }}>{badgeText}</span>
                    <h3 style={{ fontSize: 16, marginBottom: 8 }}>{ex.title}</h3>
                    {ex.start_date && <p style={{ fontSize: 13, marginBottom: 8 }}>{new Date(ex.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} — {[ex.venue, ex.location].filter(Boolean).join(', ')}</p>}
                    {ex.description && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{ex.description}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED ARTWORK */}
      <section id="featured" className="section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Artwork</h2>
            <p style={{ fontSize: 14, color: 'var(--slate-gray)' }}>A changing selection — the current highlight of the collection</p>
          </div>
          {!featured ? (
            <p style={{ textAlign: 'center', color: 'var(--slate-gray)', padding: 60 }}>No featured artwork selected yet.</p>
          ) : (
            <div className="grid grid-2" style={{ gap: 40, alignItems: 'center', maxWidth: 900, margin: '0 auto' }}>
              <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                {featured.image ? <img src={featured.image} alt={featured.title} style={{ width: '100%', display: 'block' }} />
                  : <div style={{ width: '100%', padding: '60px 0', background: '#eee', textAlign: 'center', color: '#999' }}>No Image</div>}
              </div>
              <div>
                <h3 style={{ fontSize: 13, color: 'var(--slate-gray)', letterSpacing: 2, marginBottom: 8 }}>Featured Work</h3>
                <h2 style={{ fontSize: 28, marginBottom: 8 }}>{featured.title}</h2>
                <p style={{ fontSize: 14, color: 'var(--coffee)', fontStyle: 'italic', marginBottom: 16 }}>{featured.medium} — {featured.size} — {featured.year}</p>
                <p style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>{featured.description}</p>
                <div style={{ fontSize: 24, fontWeight: 900, color: featured.sold ? 'var(--caput-mortuum)' : 'var(--coffee)', marginBottom: 16 }}>
                  {featured.sold ? 'SOLD' : `${featured.currency} ${(featured.price || 0).toLocaleString()}`}
                </div>
                {!featured.sold && <a href="#gallery" className="btn btn-primary" style={{ pointerEvents: 'auto' }}>View Gallery</a>}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="section-dark">
        <div className="container">
          <div className="section-header"><h2>Contacts</h2></div>
          <div className="contact-grid" style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="contact-item">
              <span className="contact-icon">&#9993;</span>
              <div className="contact-label">Email</div>
              <div className="contact-value">{profile?.contact_email || 'Not set'}</div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">&#9743;</span>
              <div className="contact-label">Phone</div>
              <div className="contact-value">{profile?.contact_phone || 'Not set'}</div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">&#9670;</span>
              <div className="contact-label">Instagram</div>
              <div className="contact-value">{profile?.instagram_url || 'Not set'}</div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">&#9835;</span>
              <div className="contact-label">TikTok</div>
              <div className="contact-value">{profile?.tiktok_url || 'Not set'}</div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
