'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '', email: '', phone: '', governorate: '', city: '', street: '', building: '', apartment: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentToken, setPaymentToken] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [cardInfo, setCardInfo] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const handleInitiateCheckout = async (e) => {
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
      if (!result.success) throw new Error(result.error || "Failed to initialize order.");

      setPaymentToken(result.paymentToken);
      setCreatedOrder(result.order);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDirectPaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/checkout/pay-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardInfo, paymentToken })
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Payment transaction rejected.");

      router.push(`/?status=success&orderId=${createdOrder.id}`);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-2xl">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-950 border border-red-800 text-red-200 text-sm rounded">
              {errorMessage}
            </div>
          )}

          {!paymentToken ? (
            <form onSubmit={handleInitiateCheckout} className="space-y-4">
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
                {isProcessing ? 'Validating Order...' : 'Continue to Payment'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleDirectPaymentSubmit} className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold tracking-tight text-white">Secure Card Payment</h2>
                <button type="button" className="text-xs text-zinc-400 hover:text-white underline" onClick={() => setPaymentToken(null)}>Back to Shipping</button>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Cardholder Name</label>
                <input type="text" placeholder="Name on Card" required className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 focus:outline-none focus:border-purple-500" value={cardInfo.name} onChange={e => setCardInfo({...cardInfo, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Card Number</label>
                <input type="text" maxLength="16" placeholder="1234567812345678" required className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 focus:outline-none focus:border-purple-500" value={cardInfo.number} onChange={e => setCardInfo({...cardInfo, number: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Expiry Date</label>
                  <input type="text" placeholder="MM/YY" maxLength="5" required className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 focus:outline-none focus:border-purple-500" value={cardInfo.expiry} onChange={e => setCardInfo({...cardInfo, expiry: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">CVV</label>
                  <input type="password" maxLength="4" placeholder="..." required className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 focus:outline-none focus:border-purple-500" value={cardInfo.cvv} onChange={e => setCardInfo({...cardInfo, cvv: e.target.value})} />
                </div>
              </div>
              <button type="submit" disabled={isProcessing} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold p-3 rounded transition disabled:bg-zinc-700">
                {isProcessing ? 'Processing Transaction Securely...' : 'Authorize Secure Charge'}
              </button>
            </form>
          )}
        </div>

        <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-950/50">
          <h2 className="text-lg font-bold text-white mb-4">Your Selection</h2>
          <p className="text-sm text-zinc-400">Direct integration setup mode initialized. Cart total parsing logic attached securely to your custom background pricing loop.</p>
        </div>

      </div>
    </div>
  );
}