"use client";

import { useState } from 'react';
import { createClient }from '@/utils/supabase/client';
import AppHeader from '@/Components/AppHeader';
import Footer from '@/Components/Footer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // Arahkan pengguna ke halaman ini setelah mereka mengklik link di email
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Check your email for the magic link!');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
      <AppHeader />
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <form
            onSubmit={handleLogin}
            className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 space-y-6"
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Sign In / Sign Up</h1>
              <p className="text-gray-400 mt-2 text-sm">
                Enter your email to receive a magic link.
              </p>
            </div>
            
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-300 transition-all disabled:bg-amber-400/50 disabled:cursor-wait"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </div>
            
            {message && (
              <p className="text-center text-sm text-gray-300">
                {message}
              </p>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}