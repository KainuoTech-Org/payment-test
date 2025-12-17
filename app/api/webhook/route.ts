import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: '2023-10-16',
});

// This secret comes from your Stripe Dashboard (Developers > Webhooks)
// or from the Stripe CLI if testing locally (`stripe listen`).
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const body = await request.text();
  const sig = (await headers()).get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (!endpointSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail = session.customer_details?.email;
      const amount = session.amount_total ? session.amount_total / 100 : 0;

      console.log('\n--- 🔔 Webhook Received: Payment Success! ---');
      console.log(`💰 Amount: $${amount}`);
      console.log(`📧 Customer Email: ${customerEmail}`);
      console.log(`📝 Session ID: ${session.id}`);
      console.log('🚀 Simulating sending email receipt...');
      console.log('✅ Email sent successfully (Simulated)');
      console.log('---------------------------------------------\n');
      break;
      
    default:
      // console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
