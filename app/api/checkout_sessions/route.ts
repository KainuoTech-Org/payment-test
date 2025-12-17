import { NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing. Please set it in your environment variables.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // apiVersion: '2023-10-16', // Optional: specify API version
});

export async function POST(request: Request) {
  try {
    // Determine the base URL for success/cancel redirects
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          // or create a one-time price on the fly using price_data.
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Premium Plan Service',
              images: ['https://i.imgur.com/EHyR2nP.png'], // Optional image
            },
            unit_amount: 10000, // $100.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/success`,
      cancel_url: `${origin}/`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}
