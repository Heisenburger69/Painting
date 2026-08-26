'use client'

import Link from 'next/link'

export default function ArtworkCard({ artwork }) {
  const handleShare = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/painting/${artwork.id}`
    const shareData = {
      title: artwork.title,
      text: `${artwork.title} — ${artwork.medium || ''} — EGP ${(artwork.price || 0).toLocaleString()}`,
      url,
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch (e) {}
    } else {
      await navigator.clipboard.writeText(url)
      alert('Link copied!')
    }
  }

  const priceLabel = artwork.sold
    ? 'SOLD'
    : artwork.status === 'not_for_sale'
      ? 'Not for Sale'
      : artwork.status === 'reserved'
        ? 'Reserved'
        : `EGP ${(artwork.price || 0).toLocaleString()}`

  const imageStyle = {
    aspectRatio: `${artwork.width_cm || 1}/${artwork.height_cm || 1}`,
    width: '100%',
  }

  const renderButton = () => {
    if (artwork.status === 'sold') {
      return (
        <button disabled className="btn btn-secondary art-card-btn sold-btn">
          Sold
        </button>
      )
    }
    if (artwork.status === 'not_for_sale') {
      return (
        <button disabled className="btn btn-secondary art-card-btn">
          Not for Sale
        </button>
      )
    }
    if (artwork.status === 'reserved') {
      return (
        <button disabled className="btn btn-secondary art-card-btn">
          Reserved
        </button>
      )
    }
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        <Link href={`/painting/${artwork.id}`} className="btn btn-primary art-card-btn" style={{ textDecoration: 'none', flex: 1 }}>
          Buy
        </Link>
        <button onClick={handleShare} className="btn btn-secondary art-card-btn art-card-share-btn" title="Share">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="coll-grid-item coll-art-grid-item w-full">
      <div className="coll-grid-item-inner coll-art-inner">
        <Link href={`/painting/${artwork.id}`} className="coll-art-link">
          <div className="coll-agi-frame">
            <div className={`coll-agi-frame-inner${artwork.is_on_sale ? ' on-sale' : ''}`}>
              <div className="coll-agi-image" style={imageStyle}>
                {artwork.image ? (
                  <img src={artwork.image} alt={artwork.title} />
                ) : (
                  <div className="coll-agi-noimg">No Image</div>
                )}
              </div>
            </div>
            {artwork.is_on_sale && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '-24px',
                  right: '-6px',
                  zIndex: 20,
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
                  userSelect: 'none',
                  transition: 'transform 0.2s',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                    <polygon
                      points="50,0 61,11 77,6 82,22 98,23 94,39 100,50 94,61 98,77 82,78 77,94 61,89 50,100 39,89 23,94 18,78 2,77 6,61 0,50 6,39 2,23 18,22 23,6 39,11"
                      fill="#dc2626"
                    />
                    <polygon
                      points="50,12 58,21 71,17 75,29 88,30 85,42 90,50 85,58 88,70 75,71 71,83 58,79 50,88 42,79 29,83 25,71 12,70 15,58 10,50 15,42 12,30 25,29 29,17 42,21"
                      fill="none"
                      stroke="rgba(255,255,255,0.85)"
                      strokeWidth="2"
                      strokeDasharray="4,3"
                    />
                  </svg>
                  <span
                    style={{
                      position: 'relative',
                      zIndex: 30,
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: '10px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      transform: 'rotate(12deg)',
                      display: 'block',
                      textAlign: 'center',
                      lineHeight: '1',
                    }}
                  >
                    ON<br /><span style={{ display: 'block', marginTop: '1px' }}>SALE</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </Link>
        <div className="coll-agi-body">
          <Link href={`/painting/${artwork.id}`} className="coll-art-link">
            <div className={`coll-agi-title${artwork.sold ? ' sold' : ''}`}>
              {artwork.title}
            </div>
            <div className="coll-agi-medium">{artwork.medium}</div>
            <div className="coll-agi-meta">
              {artwork.year && <span>{artwork.year}</span>}
              {artwork.size && <span>{artwork.size}</span>}
            </div>
            <div className={`coll-agi-price${artwork.sold ? ' sold' : ''}${artwork.is_on_sale ? ' on-sale' : ''}`}>
              {priceLabel}
            </div>
          </Link>
          <div className="art-card-actions">
            {renderButton()}
          </div>
        </div>
      </div>
    </div>
  )
}
