import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { cardInfo, paymentToken } = await req.json();

    const expMonth = cardInfo.expiry.split('/')[0].trim();
    const expYear = cardInfo.expiry.split('/')[1].trim();

    // Transmit card variables directly into Paymob core secure gateway vault
    const chargeRes = await fetch('https://accept.paymob.com/api/acceptance/payments/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: {
          identifier: cardInfo.number.replace(/\s+/g, ''),
          subtype: "CARD",
          cardholder_name: cardInfo.name,
          expiry_month: expMonth,
          expiry_year: expYear,
          cvv: cardInfo.cvv
        },
        payment_token: paymentToken
      })
    });

    const chargeData = await chargeRes.json();

    // Check transaction status response criteria
    if (chargeData.success === true || chargeData.success === "true" || chargeData.pending === true || chargeData.pending === "true") {
      return NextResponse.json({ success: true, data: chargeData });
    } else {
      const failReason = chargeData.data?.message || chargeData.detail || "Transaction could not be authorized.";
      return NextResponse.json({ success: false, error: failReason });
    }

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
