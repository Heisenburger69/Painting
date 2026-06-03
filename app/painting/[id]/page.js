import Link from 'next/link'
import { getArtworkById } from '@/lib/db'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PaintingPage({ params }) {
  const artwork = await getArtworkById(params.id)
  if (!artwork) notFound()

  return (
    <main className="main-content">
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container">
          <div style={{ marginBottom: 40 }}>
            <Link href="/#gallery" style={{ fontSize: 13, color: 'var(--coffee)', textDecoration: 'none' }}>&larr; Back to Gallery</Link>
          </div>

          <div className="painting-detail">
            <div className="painting-detail-image">
              {artwork.image ? (
                <img src={artwork.image} alt={artwork.title} style={{ width: '100%', borderRadius: 12, boxShadow: 'var(--shadow-lg)' }} />
              ) : (
                <div style={{ width: '100%', padding: '80px 0', background: '#eee', textAlign: 'center', color: '#999', borderRadius: 12 }}>No Image Available</div>
              )}
              {artwork.images.length > 1 && (
                <div style={{ display: 'flex', gap: 10, marginTop: 16, overflowX: 'auto' }}>
                  {artwork.images.map((url, i) => (
                    <img key={i} src={url} alt={`${artwork.title} view ${i + 1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: i === 0 ? '2px solid var(--coffee)' : '2px solid transparent' }} />
                  ))}
                </div>
              )}
            </div>

            <div className="painting-detail-info">
              <div className="detail-badge">{artwork.status === 'sold' ? 'SOLD' : artwork.status === 'reserved' ? 'RESERVED' : 'AVAILABLE'}</div>
              <h1 className="detail-title">{artwork.title}</h1>
              {artwork.medium && <p className="detail-subtitle">{artwork.medium} — {artwork.year}</p>}
              {artwork.size && <p className="detail-dimensions">{artwork.size}</p>}
              {artwork.description && (
                <div className="detail-description">
                  {artwork.description.split('\n').filter(Boolean).map((p, i) => (<p key={i}>{p}</p>))}
                </div>
              )}
              <div className="detail-price">
                {artwork.sold ? 'SOLD' : `${artwork.currency} ${(artwork.price || 0).toLocaleString()}`}
              </div>
              <div className="detail-actions">
                <a href="/#contacts" className="btn btn-primary">Inquire About This Work</a>
                <Link href="/#gallery" className="btn btn-secondary">Back to Gallery</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
