'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/app/context/CartContext'

export default function FloatingCart() {
  const [open, setOpen] = useState(false)
  const { cart, removeFromCart } = useCart()
  const panelRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0)

  return (
    <div className="floating-cart-wrapper" ref={panelRef}>
      <button className="floating-cart-btn" onClick={() => setOpen(!open)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {cart.length > 0 && <span className="floating-cart-count">{cart.length}</span>}
      </button>

      {open && cart.length > 0 && (
        <div className="floating-cart-panel">
          <div className="floating-cart-panel-header">
            <strong>Shopping Cart</strong>
            <span>{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
          </div>
          <div className="floating-cart-items">
            {cart.map((item) => (
              <div key={item.id} className="floating-cart-item">
                <div className="floating-cart-item-info">
                  {item.image && <img src={item.image} alt={item.title} className="floating-cart-item-img" />}
                  <div>
                    <div className="floating-cart-item-title">{item.title}</div>
                    <div className="floating-cart-item-price">EGP {(item.price || 0).toLocaleString()}</div>
                  </div>
                </div>
                <button className="floating-cart-item-remove" onClick={() => removeFromCart(item.id)}>&times;</button>
              </div>
            ))}
          </div>
          <div className="floating-cart-panel-footer">
            <div className="floating-cart-total">
              <span>Total</span>
              <span>EGP {total.toLocaleString()}</span>
            </div>
            <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }} onClick={() => setOpen(false)}>
              Checkout
            </Link>
          </div>
        </div>
      )}

      {open && cart.length === 0 && (
        <div className="floating-cart-panel">
          <div className="floating-cart-panel-header">
            <strong>Shopping Cart</strong>
          </div>
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--slate-gray)', fontSize: 13 }}>Your cart is empty</div>
        </div>
      )}
    </div>
  )
}
