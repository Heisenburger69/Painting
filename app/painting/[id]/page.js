import Link from 'next/link'
import { getArtworkById } from '@/lib/db'
import { notFound } from 'next/navigation'
import ImageSlideshow from '@/components/ImageSlideshow'
import PaintingActions from '@/components/PaintingActions'

export const dynamic = 'force-dynamic'

export default async function PaintingPage({ params }) {
  const { id } = await params
  const artwork = await getArtworkById(id)
  if (!artwork) notFound()

  return (
    <main className="main-content">
      <section className="section" style={{ padding: '0 0 16px' }}>
        <div className="container">
          <div style={{ paddingTop: 4, marginBottom: 8 }}>
            <Link href="/#gallery" style={{ fontSize: 13, color: 'var(--coffee)', textDecoration: 'none' }}>&larr; Back to Gallery</Link>
          </div>

          <div className="painting-detail">
            <div className="painting-detail-image">
              {artwork.image ? (
                <ImageSlideshow images={artwork.images} title={artwork.title} />
              ) : (
                <div style={{ width: '100%', padding: '80px 0', background: '#eee', textAlign: 'center', color: '#999', borderRadius: 12 }}>No Image Available</div>
              )}
            </div>

            <div className="painting-detail-info">
              <div className="detail-price-row">
                <span className="detail-price">{artwork.sold ? 'SOLD' : `EGP ${(artwork.price || 0).toLocaleString()}`}</span>
                <span className="detail-badge">{artwork.status === 'sold' ? 'SOLD' : artwork.status === 'reserved' ? 'RESERVED' : artwork.status === 'not_for_sale' ? 'NOT FOR SALE' : 'AVAILABLE'}</span>
              </div>
              <h1 className="detail-title">{artwork.title}</h1>
              {artwork.medium && <p className="detail-subtitle">{artwork.medium} — {artwork.year}</p>}
              {artwork.size && <p className="detail-dimensions">{artwork.size} {artwork.size_inches && <span className="detail-inches">| {artwork.size_inches}</span>}</p>}
              {artwork.collection_name && (
                <p style={{ fontSize: 13, color: 'var(--coffee)', fontStyle: 'italic' }}>
                  From the collection: <Link href="/#gallery" style={{ color: 'var(--caput-mortuum)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--tan)' }}>{artwork.collection_name}</Link>
                </p>
              )}
              {artwork.description && (
                <div className="detail-description">
                  {artwork.description.split('\n').filter(Boolean).map((p, i) => (<p key={i}>{p}</p>))}
                </div>
              )}
              <PaintingActions artwork={artwork} />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
