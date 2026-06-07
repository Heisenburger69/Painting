import Link from 'next/link'
import { getCollectionById } from '@/lib/db'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CollectionPage({ params }) {
  const { id } = await params
  const collection = await getCollectionById(id)
  if (!collection) notFound()

  return (
    <main className="main-content">
      <div className="coll-detail-hero">
        {collection.cover_image ? (
          <img className="coll-detail-hero-bg" src={collection.cover_image} alt="" />
        ) : (
          <div className="coll-detail-hero-cover-fallback">{collection.title}</div>
        )}
        <div className="coll-detail-hero-overlay" />
        <div className="coll-detail-hero-content">
          <h1 className="coll-detail-hero-title">{collection.title}</h1>
          {collection.description && (
            <p className="coll-detail-hero-desc">{collection.description}</p>
          )}
          <span className="coll-detail-hero-count">
            {collection.artworks.length} {collection.artworks.length === 1 ? 'work' : 'works'}
          </span>
        </div>
      </div>

      <section className="section" style={{ padding: '0 0 48px' }}>
        <div className="container">
          <div style={{ marginBottom: 16 }}>
            <Link href="/#gallery" style={{ fontSize: 13, color: 'var(--coffee)', textDecoration: 'none' }}>&larr; Back to Gallery</Link>
          </div>

          {collection.artworks.length > 0 ? (
            <div className="coll-grid-slot">
              {collection.artworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--slate-gray)', fontSize: 14, marginTop: 40, opacity: 0.6 }}>
              No artworks in this collection yet.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}

function ArtworkCard({ artwork }) {
  const priceLabel = artwork.sold
    ? 'SOLD'
    : artwork.stock === 0
      ? 'OUT'
      : artwork.stock
        ? `${artwork.stock}`
        : `EGP ${(artwork.price || 0).toLocaleString()}`

  return (
    <Link
      href={`/painting/${artwork.id}`}
      className="coll-grid-item coll-art-grid-item"
    >
      <div className="coll-grid-item-inner coll-art-inner">
        <div className="coll-agi-frame">
          <div className="coll-agi-frame-inner">
            <div className="coll-agi-image">
              {artwork.image ? (
                <img src={artwork.image} alt={artwork.title} />
              ) : (
                <div className="coll-agi-noimg">No Image</div>
              )}
            </div>
          </div>
        </div>
        <div className="coll-agi-body">
          <div className={`coll-agi-title${artwork.sold ? ' sold' : ''}`}>
            {artwork.title}
          </div>
          <div className="coll-agi-medium">{artwork.medium}</div>
          <div className="coll-agi-meta">
            {artwork.year && <span>{artwork.year}</span>}
            {artwork.size && <span>{artwork.size}</span>}
          </div>
          <div className={`coll-agi-price${artwork.sold ? ' sold' : ''}`}>
            {priceLabel}
          </div>
        </div>
      </div>
    </Link>
  )
}
