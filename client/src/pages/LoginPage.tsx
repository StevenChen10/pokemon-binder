import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage('Check your email for a confirmation link.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/i-spent-a-few-hours-making-this-for-wallpaper-engine-so-i-v0-nIBSaLdr_qlU5r4x2mv2PxZpu2eXB0y06cQQrxANKco.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="w-full max-w-md relative z-10">
        {/* Main device card */}
        <div
          className="rounded-3xl p-8 relative"
          style={{
            backgroundColor: '#e0e5ec',
            boxShadow: '12px 12px 24px #babecc, -12px -12px 24px #ffffff, inset 1px 1px 0 rgba(255,255,255,0.5)',
            backgroundImage: `
              radial-gradient(circle at 20px 20px, rgba(0,0,0,0.12) 2px, transparent 3px),
              radial-gradient(circle at calc(100% - 20px) 20px, rgba(0,0,0,0.12) 2px, transparent 3px),
              radial-gradient(circle at 20px calc(100% - 20px), rgba(0,0,0,0.12) 2px, transparent 3px),
              radial-gradient(circle at calc(100% - 20px) calc(100% - 20px), rgba(0,0,0,0.12) 2px, transparent 3px)
            `,
          }}
        >
          {/* Vent slots */}
          <div className="absolute top-5 right-12 flex gap-1">
            <div className="h-6 w-1 rounded-full" style={{ backgroundColor: '#d1d9e6', boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)' }} />
            <div className="h-6 w-1 rounded-full" style={{ backgroundColor: '#d1d9e6', boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)' }} />
            <div className="h-6 w-1 rounded-full" style={{ backgroundColor: '#d1d9e6', boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)' }} />
          </div>

          {/* Header section with device screen */}
          <div
            className="rounded-2xl p-6 mb-8 relative overflow-hidden"
            style={{
              backgroundColor: '#2d3436',
              boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(255,255,255,0.05)',
              border: '3px solid #1a1a2e',
            }}
          >
            {/* Scanline overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                background: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%)',
                backgroundSize: '100% 4px',
              }}
            />

            {/* Power LED */}
            <div className="absolute top-3 right-4 flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: '#22c55e',
                  boxShadow: '0 0 8px 2px rgba(34,197,94,0.6)',
                }}
              />
              <span
                className="text-green-400 uppercase tracking-widest"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', fontWeight: 500 }}
              >
                PWR
              </span>
            </div>

            {/* 3D Pokeball icon */}
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: '#e0e5ec',
                  boxShadow: '4px 4px 10px rgba(0,0,0,0.3), -2px -2px 6px rgba(255,255,255,0.1)',
                }}
              >
                <svg viewBox="0 0 100 100" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="login-ball-top" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#ff4444" />
                      <stop offset="40%" stopColor="#cc0000" />
                      <stop offset="100%" stopColor="#8b0000" />
                    </radialGradient>
                    <radialGradient id="login-ball-bottom" cx="40%" cy="40%" r="70%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="50%" stopColor="#e8e8e8" />
                      <stop offset="100%" stopColor="#b0b0b0" />
                    </radialGradient>
                    <radialGradient id="login-shine" cx="30%" cy="25%" r="50%">
                      <stop offset="0%" stopColor="white" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="white" stopOpacity={0} />
                    </radialGradient>
                  </defs>
                  <circle cx="50" cy="50" r="47" fill="url(#login-ball-bottom)" />
                  <path d="M3 50 A47 47 0 0 1 97 50 Z" fill="url(#login-ball-top)" />
                  <rect x="3" y="46" width="94" height="8" fill="#2a2a2a" rx="1" />
                  <circle cx="50" cy="50" r="11" fill="#e8e8e8" stroke="#555" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="6" fill="white" stroke="#888" strokeWidth="1" />
                  <ellipse cx="36" cy="30" rx="18" ry="14" fill="url(#login-shine)" />
                </svg>
              </div>
            </div>

            <h1
              className="text-center text-white font-extrabold text-3xl tracking-tight"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
            >
              Pokémon Binder
            </h1>
            <p
              className="text-center mt-1 uppercase tracking-widest"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem',
                fontWeight: 500,
                color: '#a8b2d1',
              }}
            >
              Collection Management System
            </p>
          </div>

          {/* Mode label */}
          <div className="flex items-center gap-2 mb-5">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: '#ff4757',
                boxShadow: '0 0 8px 2px rgba(255,71,87,0.5)',
              }}
            />
            <span
              className="uppercase tracking-widest text-[#4a5568] font-bold"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem',
                textShadow: '0 1px 0 #ffffff',
              }}
            >
              {isSignUp ? 'New Trainer Registration' : 'Trainer Authentication'}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email input */}
            <div>
              <label
                className="block mb-1.5 uppercase tracking-widest text-[#4a5568] font-bold"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.65rem',
                  textShadow: '0 1px 0 #ffffff',
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trainer@pokemon.com"
                required
                className="w-full h-14 px-5 rounded-lg border-none outline-none text-[#2d3436] placeholder-[#4a5568]/40 focus:ring-0"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.9rem',
                  backgroundColor: '#e0e5ec',
                  boxShadow: 'inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff',
                  transition: 'box-shadow 200ms ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff, 0 0 0 2px #ff4757';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff';
                }}
              />
            </div>

            {/* Password input */}
            <div>
              <label
                className="block mb-1.5 uppercase tracking-widest text-[#4a5568] font-bold"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.65rem',
                  textShadow: '0 1px 0 #ffffff',
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-14 px-5 rounded-lg border-none outline-none text-[#2d3436] placeholder-[#4a5568]/40 focus:ring-0"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.9rem',
                  backgroundColor: '#e0e5ec',
                  boxShadow: 'inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff',
                  transition: 'box-shadow 200ms ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff, 0 0 0 2px #ff4757';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff';
                }}
              />
            </div>

            {/* Error / Message */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg" style={{ backgroundColor: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#ff4757', boxShadow: '0 0 6px rgba(255,71,87,0.5)' }} />
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#ff4757', fontWeight: 500 }}>
                  {error}
                </p>
              </div>
            )}
            {message && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.5)' }} />
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#22c55e', fontWeight: 500 }}>
                  {message}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl uppercase tracking-widest font-bold text-white mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.85rem',
                backgroundColor: '#ff4757',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '4px 4px 8px rgba(166,50,60,0.4), -4px -4px 8px rgba(255,100,110,0.4)',
                transition: 'all 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseDown={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(2px)';
                  e.currentTarget.style.boxShadow = 'inset 6px 6px 12px rgba(166,50,60,0.4), inset -6px -6px 12px rgba(255,100,110,0.4)';
                }
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '4px 4px 8px rgba(166,50,60,0.4), -4px -4px 8px rgba(255,100,110,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '4px 4px 8px rgba(166,50,60,0.4), -4px -4px 8px rgba(255,100,110,0.4)';
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : isSignUp ? 'Register' : 'Authenticate'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #babecc, transparent)' }} />
            <span
              className="uppercase tracking-widest text-[#4a5568]"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', fontWeight: 500 }}
            >
              or
            </span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #babecc, transparent)' }} />
          </div>

          {/* Toggle button */}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
            className="w-full h-12 rounded-xl uppercase tracking-widest font-bold text-[#2d3436]"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              backgroundColor: '#e0e5ec',
              boxShadow: '4px 4px 8px #babecc, -4px -4px 8px #ffffff',
              transition: 'all 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(2px)';
              e.currentTarget.style.boxShadow = 'inset 6px 6px 12px #babecc, inset -6px -6px 12px #ffffff';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '4px 4px 8px #babecc, -4px -4px 8px #ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '4px 4px 8px #babecc, -4px -4px 8px #ffffff';
            }}
          >
            {isSignUp ? 'Existing Trainer? Sign In' : 'New Trainer? Register'}
          </button>

          {/* Footer status bar */}
          <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '1px solid #d1d9e6' }}>
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.5)' }}
              />
              <span
                className="uppercase tracking-widest text-[#4a5568]"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', fontWeight: 500, textShadow: '0 1px 0 #ffffff' }}
              >
                System Online
              </span>
            </div>
            <span
              className="uppercase tracking-widest text-[#4a5568]"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', fontWeight: 500, textShadow: '0 1px 0 #ffffff' }}
            >
              v1.0.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
