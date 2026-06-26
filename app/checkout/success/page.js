'use client';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get('checkout_id');
  const success = searchParams.get('success');
  const [status, setStatus] = useState('verifying');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (!checkoutId) {
      setStatus('no_order');
      return;
    }

    let cancelled = false;

    const tryConfirm = async () => {
      try {
        const res = await fetch(`/api/confirm-checkout?checkout_id=${checkoutId}&success=true`);
        const data = await res.json();
        if (!cancelled && data.confirmed && data.order) {
          setOrderId(data.order.id || '');
          setStatus('confirmed');
          return true;
        }
      } catch {}
      return false;
    };

    const init = async () => {
      if (success === 'true') {
        const done = await tryConfirm();
        if (done || cancelled) return;
      }

      const poll = async () => {
        try {
          const res = await fetch(`/api/lookup-order?checkout_id=${checkoutId}`);
          const data = await res.json();
          if (!cancelled && data.found && data.order) {
            setOrderId(data.order.id || '');
            setStatus('confirmed');
            return;
          }
        } catch {}

        if (!cancelled) {
          setTimeout(poll, 2000);
        }
      };

      poll();
    };

    init();
    return () => { cancelled = true; };
  }, [checkoutId, success]);

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
          Thank you for your purchase. A confirmation email with your order details has been sent to your inbox.
        </p>
        {orderId && (
          <div style={{ margin: '24px 0', padding: 16, background: 'var(--bg-cream)', borderRadius: 8 }}>
            <p style={{ fontSize: 13, color: 'var(--slate-gray)', marginBottom: 4 }}>Order ID</p>
            <p style={{ fontSize: 28, fontWeight: 700, letterSpacing: 6, fontFamily: 'monospace' }}>{orderId.slice(0, 8).toUpperCase()}</p>
          </div>
        )}
        <Link href="/" className="btn btn-primary">
          Back to Gallery
        </Link>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <main className="main-content" style={{ paddingTop: 120, textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 520, margin: '0 auto' }}>
          <p style={{ fontSize: 18, color: 'var(--slate-gray)' }}>Loading order details...</p>
        </div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
