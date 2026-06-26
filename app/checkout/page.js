'use client';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/app/context/CartContext';
import { GOVERNORATE_RATES, calculateFedExShipping } from '@/lib/shipping';

function ShippingTooltip() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          width: 18, height: 18, borderRadius: '50%',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#888',
          border: '1.5px solid #ccc', marginLeft: 6, padding: 0,
          lineHeight: 1, transition: 'border-color 0.15s, color 0.15s',
        }}
        aria-label="Shipping cost details"
      >?</button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0,
          background: '#1a1a2e', color: '#f0f0f0', borderRadius: 8,
          padding: '14px 16px', fontSize: 13, lineHeight: 1.6,
          width: 300, zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#fff', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Why shipping costs what it does</p>
          <ul style={{ margin: 0, paddingLeft: 16, color: '#ccc' }}>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>Size over weight</strong> — Paintings are charged by the space they occupy, not their weight. A large canvas takes up room that could hold multiple smaller items.</li>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>Premium packaging</strong> — Every piece is wrapped, padded, and boxed to arrive in perfect condition. The materials and care add to the cost.</li>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>Region-based pricing</strong> — FedEx rates vary by governorate. Deliveries farther from Cairo (e.g. Assiut, Luxor) cost more than those within greater Cairo.</li>
          </ul>
        </div>
      )}
    </span>
  );
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', governorate: 'cairo',
    city: '', street: '', building: '', apartment: ''
  });

  const itemsTotal = cart.reduce((acc, item) => acc + Number(item.price), 0);

  useEffect(() => {
    const { totalShipping } = calculateFedExShipping(cart, form.governorate);
    setShippingCost(totalShipping);
  }, [form.governorate, cart]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Your cart is empty.');
    setLoading(true);

    const customerInfo = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      governorate: form.governorate,
      city: form.city,
      street: form.street,
      building: form.building,
      apartment: form.apartment
    };

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, customerInfo })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Something went wrong during checkout initialization.');
      }

      if (data.redirectUrl) {
        clearCart();
        window.location.href = data.redirectUrl;
      }

    } catch (err) {
      alert(`Checkout operation rejected: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content" style={{ paddingTop: 100 }}>
      <div className="container" style={{ maxWidth: 640, margin: '0 auto' }}>
        <h2 style={{ marginBottom: 24 }}>Secure Checkout</h2>

        {cart.length === 0 ? (
          <p style={{ color: 'var(--slate-gray)' }}>Your cart is empty.</p>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--slate-gray)' }}>Items ({cart.length})</h3>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span>{item.title}</span>
                  <span style={{ fontWeight: 600 }}>{Number(item.price).toLocaleString()} EGP</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="admin-field" style={{ gridColumn: 'span 2' }}>
                  <label>Full Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="admin-field">
                  <label>Email Address</label>
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="admin-field">
                  <label>Phone Number</label>
                  <input type="text" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="admin-field">
                  <label>Governorate</label>
                  <select value={form.governorate} onChange={e => setForm({...form, governorate: e.target.value})}>
                    {Object.entries(GOVERNORATE_RATES).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([key, obj]) => (
                      <option key={key} value={key}>{obj.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label>City / District</label>
                  <input type="text" required value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                </div>
                <div className="admin-field" style={{ gridColumn: 'span 2' }}>
                  <label>Street Name / Address Line</label>
                  <input type="text" required value={form.street} onChange={e => setForm({...form, street: e.target.value})} />
                </div>
                <div className="admin-field">
                  <label>Building No.</label>
                  <input type="text" required value={form.building} onChange={e => setForm({...form, building: e.target.value})} />
                </div>
                <div className="admin-field">
                  <label>Apartment No.</label>
                  <input type="text" required value={form.apartment} onChange={e => setForm({...form, apartment: e.target.value})} />
                </div>
              </div>

              <div style={{ padding: 16, background: 'var(--bg-cream)', borderRadius: 8, margin: '24px 0' }}>
                <p style={{ fontSize: 14, marginBottom: 6 }}>Items Subtotal: <strong>{itemsTotal.toLocaleString()} EGP</strong></p>
                <p style={{ fontSize: 14, marginBottom: 6 }}>Shipping Costs: <strong>{shippingCost.toLocaleString()} EGP</strong><ShippingTooltip /></p>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />
                <h3 style={{ fontSize: 18 }}>Total Due: {(itemsTotal + shippingCost).toLocaleString()} EGP</h3>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                {loading ? 'Processing Transaction Context...' : 'Proceed to Payment Gateway'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
