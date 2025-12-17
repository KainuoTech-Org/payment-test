'use client';

import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function Home() {
  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        console.error('No checkout URL returned');
      }

      /* 
      // Alternative using stripe.redirectToCheckout (if available in your version)
      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      if (stripe) {
        // @ts-ignore
        const { error } = await stripe.redirectToCheckout({ sessionId });
      } 
      */

    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-gray-800">Stripe Checkout Demo</h1>
        
        <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col items-center gap-4">
          <p className="text-lg text-gray-600">Product: Premium Plan</p>
          <p className="text-3xl font-bold text-gray-900">$100.00</p>
          
          <button
            onClick={handleCheckout}
            className="mt-4 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            立即支付 $100
          </button>
          
          <p className="text-xs text-gray-400 mt-2 text-center max-w-xs">
            Securely pay with Visa, Mastercard, AMEX, and Virtual Cards
          </p>
        </div>
      </div>
    </main>
  );
}
