import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing. Please set it in your environment variables.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // apiVersion: '2023-10-16',
});

const resend = new Resend(process.env.RESEND_API_KEY);

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
      const customerName = session.customer_details?.name || 'Valued Customer';
      const amount = session.amount_total ? session.amount_total / 100 : 0;

      console.log('\n--- 🔔 Webhook Received: Payment Success! ---');
      console.log(`💰 Amount: $${amount}`);
      console.log(`📧 Customer Email: ${customerEmail}`);
      
      if (customerEmail && process.env.RESEND_API_KEY) {
        try {
            await resend.emails.send({
                from: 'Yorsson Payment <onboarding@resend.dev>', // Default Resend test email
                to: customerEmail,
                subject: 'Payment Successful - Yorsson',
                html: `
                  <h1>Thank you for your purchase, ${customerName}!</h1>
                  <p>We have successfully received your payment of <strong>$${amount}</strong>.</p>
                  <p>Your transaction ID is: ${session.id}</p>
                  <br/>
                  <p>Best regards,</p>
                  <p>The Yorsson Team</p>
                `
            });
            console.log('✅ Real Email sent via Resend!');
        } catch (emailErr) {
            console.error('❌ Failed to send email:', emailErr);
        }
      } else {
          console.log('⚠️  Skipping email: RESEND_API_KEY not set or no email provided.');
      }
      
      console.log('---------------------------------------------\n');
      break;
      
    default:
      // console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
