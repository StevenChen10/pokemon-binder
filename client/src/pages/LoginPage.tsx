import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #CC0000 50%, #1B3A6B 50%)' }}>
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-sm border-4 border-pokemon-yellow shadow-2xl overflow-hidden">
          <CardHeader className="bg-pokemon-navy text-center pb-6 pt-8">
            <div className="text-5xl mb-2">🎴</div>
            <CardTitle className="text-2xl font-black text-pokemon-yellow tracking-wide">
              Pokémon Binder
            </CardTitle>
            <CardDescription className="text-blue-200">
              Your personal card collection
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <h2 className="text-lg font-bold text-pokemon-navy mb-4">
              {isSignUp ? 'Create an account' : 'Welcome back!'}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="font-semibold"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="font-semibold"
              />

              {error && <p className="text-destructive text-sm font-semibold">{error}</p>}
              {message && <p className="text-green-600 text-sm font-semibold">{message}</p>}

              <Button type="submit" disabled={loading} className="bg-pokemon-yellow text-pokemon-navy font-black text-lg hover:brightness-95 mt-1">
                {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </form>

            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-4 text-sm text-pokemon-blue font-bold hover:underline w-full text-center"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
