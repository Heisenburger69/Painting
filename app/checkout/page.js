'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { GOVERNORATE_RATES, calculateFedExShipping } from '@/lib/shipping';

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
        throw new Error(data.error || "Something went wrong during checkout initialization.");
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
                <p style={{ fontSize: 14, marginBottom: 6 }}>FedEx Shipping Cost: <strong>{shippingCost.toLocaleString()} EGP</strong></p>
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
