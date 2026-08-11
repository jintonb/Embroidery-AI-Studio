'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function BillingPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.accessToken) {
      fetchCredits();
    }
  }, [session]);

  const fetchCredits = async () => {
    try {
      const res = await fetch('http://localhost:8000/billing/credits', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits);
      }
    } catch (error) {
      console.error("Failed to fetch credits", error);
    }
  };

  const buyCredits = async (amount: number) => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({ credits: amount })
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url; // Redirect to Stripe
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      {searchParams.get('success') && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> Your payment was successful and credits have been added.</span>
        </div>
      )}
      {searchParams.get('canceled') && (
        <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Canceled.</strong>
          <span className="block sm:inline"> The payment process was canceled.</span>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Billing & Credits</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Current Balance: <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xl">{credits !== null ? credits : '...'} Credits</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Pack */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Starter Pack</h3>
            <p className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">$10</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">100 Embroidery Credits</p>
          </div>
          <button
            onClick={() => buyCredits(100)}
            disabled={isLoading}
            className="mt-8 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 font-bold py-2 px-4 rounded w-full"
          >
            Buy Starter Pack
          </button>
        </div>
        
        {/* Pro Pack */}
        <div className="border-2 border-indigo-500 rounded-lg p-6 flex flex-col justify-between relative shadow-lg">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
            POPULAR
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Pro Pack</h3>
            <p className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">$25</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">300 Embroidery Credits</p>
          </div>
          <button
            onClick={() => buyCredits(300)}
            disabled={isLoading}
            className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded w-full"
          >
            Buy Pro Pack
          </button>
        </div>

        {/* Agency Pack */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Agency Pack</h3>
            <p className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">$50</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">750 Embroidery Credits</p>
          </div>
          <button
            onClick={() => buyCredits(750)}
            disabled={isLoading}
            className="mt-8 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 font-bold py-2 px-4 rounded w-full"
          >
            Buy Agency Pack
          </button>
        </div>
      </div>
    </div>
  );
}
