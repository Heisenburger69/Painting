import Link from 'next/link'
import { getCollectionById } from '@/lib/db'
import { notFound } from 'next/navigation'
import ArtworkCard from '@/components/ArtworkCard'

export const dynamic = 'force-dynamic'

export default async function CollectionPage({ params }) {
  const { id } = await params
  const collection = await getCollectionById(id)
  if (!collection) notFound()

  return (
    <main className="main-content">
      <div className="coll-detail-hero">
        {collection.cover_image ? (
          <div className="coll-detail-hero-image">
            <img src={collection.cover_image} alt="" />
          </div>
        ) : (
          <div className="coll-detail-hero-image coll-detail-hero-image-fallback">
            <span>{collection.title}</span>
          </div>
        )}
        <div className="coll-detail-hero-overlay" />
        <div className="coll-detail-hero-body">
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
            <div className="coll-art-masonry">
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
