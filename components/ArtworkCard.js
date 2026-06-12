'use client'

import Link from 'next/link'
import { useCart } from '@/app/context/CartContext'

export default function ArtworkCard({ artwork }) {
  const { addToCart, cart } = useCart()

  const inCart = cart.some((item) => item.id === artwork.id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(artwork)
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
    minHeight: 120,
    maxHeight: 420,
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
    if (inCart) {
      return (
        <button disabled className="btn btn-secondary art-card-btn in-cart-btn">
          In Cart
        </button>
      )
    }
    return (
      <button className="btn btn-primary art-card-btn add-btn" onClick={handleAddToCart}>
        Add to Cart
      </button>
    )
  }

  return (
    <div className="coll-grid-item coll-art-grid-item">
      <div className="coll-grid-item-inner coll-art-inner">
        <Link href={`/painting/${artwork.id}`} className="coll-art-link">
          <div className="coll-agi-frame">
            <div className="coll-agi-frame-inner">
              <div className="coll-agi-image" style={imageStyle}>
                {artwork.image ? (
                  <img src={artwork.image} alt={artwork.title} />
                ) : (
                  <div className="coll-agi-noimg">No Image</div>
                )}
              </div>
            </div>
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
            <div className={`coll-agi-price${artwork.sold ? ' sold' : ''}`}>
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
