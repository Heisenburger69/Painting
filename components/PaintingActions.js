'use client'

import Link from 'next/link'
import { useCart } from '@/app/context/CartContext'

export default function PaintingActions({ artwork }) {
  const { addToCart, cart } = useCart()
  const inCart = cart.some((item) => item.id === artwork.id)

  const handleAddToCart = () => addToCart(artwork)

  const renderButton = () => {
    if (artwork.status === 'sold') {
      return <button disabled className="btn btn-secondary" style={{ background: '#d1d5db', color: '#6b7280', cursor: 'not-allowed', border: 'none' }}>Sold</button>
    }
    if (artwork.status === 'not_for_sale') {
      return <button disabled className="btn btn-secondary" style={{ background: '#d1d5db', color: '#6b7280', cursor: 'not-allowed', border: 'none' }}>Not for Sale</button>
    }
    if (artwork.status === 'reserved') {
      return <button disabled className="btn btn-secondary" style={{ background: '#d1d5db', color: '#6b7280', cursor: 'not-allowed', border: 'none' }}>Reserved</button>
    }
    if (inCart) {
      return <button disabled className="btn btn-secondary" style={{ background: '#d1d5db', color: '#6b7280', cursor: 'not-allowed', border: 'none' }}>In Cart</button>
    }
    return <button className="btn btn-primary" onClick={handleAddToCart}>Add to Cart</button>
  }

  return (
    <div>
      <div className="detail-actions">
        {renderButton()}
        <Link href="/#gallery" className="btn btn-secondary">Back to Gallery</Link>
      </div>
      <p style={{ marginTop: 16, padding: '10px 14px', background: 'var(--bg-cream)', borderRadius: 6, fontSize: 13, fontWeight: 500, color: 'var(--slate-gray)', border: '1px solid var(--border)' }}>
        <strong style={{ color: 'var(--coffee)' }}>Ordering from abroad?</strong> <a href="/#contacts" style={{ color: 'var(--coffee)', fontWeight: 600, textDecoration: 'underline' }}>Contact us</a> for shipping arrangements.
      </p>
    </div>
  )
}
