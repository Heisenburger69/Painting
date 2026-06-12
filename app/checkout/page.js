'use client';
import { useState } from 'react';

export default function CheckoutPage() {
  const [cart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '', email: '', phone: '', governorate: '', city: '', street: '', building: '', apartment: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, customerInfo })
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Checkout failed.");

      window.location.href = result.redirectUrl;
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950 border border-red-800 text-red-200 text-sm rounded">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-2xl space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-white mb-4">Shipping Details</h2>

          <input type="text" placeholder="Full Name" required className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 focus:outline-none focus:border-purple-500" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />

          <input type="email" placeholder="Email Address" required className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 focus:outline-none focus:border-purple-500" value={customerInfo.email} onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})} />

          <input type="tel" placeholder="Phone Number" required className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 focus:outline-none focus:border-purple-500" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />

          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="Governorate" required className="bg-zinc-800 border border-zinc-700 rounded p-2" value={customerInfo.governorate} onChange={e => setCustomerInfo({...customerInfo, governorate: e.target.value})} />
            <input type="text" placeholder="City" required className="bg-zinc-800 border border-zinc-700 rounded p-2" value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})} />
          </div>

          <input type="text" placeholder="Street Address" required className="w-full bg-zinc-800 border border-zinc-700 rounded p-2" value={customerInfo.street} onChange={e => setCustomerInfo({...customerInfo, street: e.target.value})} />

          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="Building No." required className="bg-zinc-800 border border-zinc-700 rounded p-2" value={customerInfo.building} onChange={e => setCustomerInfo({...customerInfo, building: e.target.value})} />
            <input type="text" placeholder="Apartment No." required className="bg-zinc-800 border border-zinc-700 rounded p-2" value={customerInfo.apartment} onChange={e => setCustomerInfo({...customerInfo, apartment: e.target.value})} />
          </div>

          <button type="submit" disabled={isProcessing} className="w-full bg-zinc-100 hover:bg-white text-black font-semibold p-3 rounded transition disabled:bg-zinc-700">
            {isProcessing ? 'Processing...' : 'Place Order & Pay'}
          </button>
        </form>
      </div>
    </div>
  );
}
