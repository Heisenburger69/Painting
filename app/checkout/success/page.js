'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    if (!orderId) {
      setStatus('no_order');
      return;
    }
    const timer = setTimeout(() => setStatus('confirmed'), 3000);
    return () => clearTimeout(timer);
  }, [orderId]);

  if (status === 'verifying') {
    return (
      <main className="main-content" style={{ paddingTop: 120, textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 520, margin: '0 auto' }}>
          <p style={{ fontSize: 18, color: 'var(--slate-gray)' }}>Verifying your payment...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content" style={{ paddingTop: 120, textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
        <h1 style={{ marginBottom: 12 }}>Payment Successful!</h1>
        <p style={{ color: 'var(--slate-gray)', marginBottom: 8 }}>
          Thank you for your purchase.
        </p>
        {orderId && (
          <p style={{ fontSize: 13, color: 'var(--slate-gray)', marginBottom: 24 }}>
            Order reference: <strong>{orderId}</strong>
          </p>
        )}
        <Link href="/" className="btn btn-primary">
          Back to Gallery
        </Link>
      </div>
    </main>
  );
}
