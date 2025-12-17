'use client';

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PayPalPage() {
  const [invoiceId, setInvoiceId] = useState('');

  useEffect(() => {
    // Generate a unique invoice ID on client side
    setInvoiceId(`ORD-${Date.now()}`);
  }, []);

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    currency: 'USD',
    intent: 'capture',
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex flex-col gap-8">
        <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="text-blue-500 hover:underline">
                &larr; Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-800">PayPal Checkout Demo</h1>
        </div>
        
        <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col items-center gap-4 w-full max-w-md">
          <p className="text-lg text-gray-600">Product: Premium Plan</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">$100.00</p>
          {invoiceId && (
            <p className="text-xs text-gray-500 mb-4 bg-gray-100 px-2 py-1 rounded">
              Order ID: {invoiceId}
            </p>
          )}
          
          <div className="w-full">
            <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons
                    style={{ layout: 'vertical' }}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [
                                {
                                    amount: {
                                        currency_code: "USD",
                                        value: "100.00",
                                    },
                                    invoice_id: invoiceId,
                                    custom_id: invoiceId, // Also set custom_id for reference
                                },
                            ],
                        });
                    }}
                    onApprove={async (data, actions) => {
                        if (actions.order) {
                            try {
                                await actions.order.capture();
                                // Directly redirect without alert to prevent popup freezing
                                window.location.href = '/success';
                            } catch (error) {
                                console.error("Capture Error:", error);
                            }
                        }
                    }}
                    onError={(err) => {
                        console.error("PayPal Checkout Error:", err);
                        alert("An error occurred during payment.");
                    }}
                />
            </PayPalScriptProvider>
          </div>
          
          <p className="text-xs text-gray-400 mt-2 text-center">
            Securely pay with PayPal Sandbox
          </p>
        </div>
      </div>
    </main>
  );
}
