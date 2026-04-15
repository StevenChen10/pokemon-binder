import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import SearchPage from './pages/SearchPage';
import CollectionPage from './pages/CollectionPage';
import WishlistPage from './pages/WishlistPage';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the initial session on load
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Listen for auth state changes (login, logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <BrowserRouter>
      {session && <Navbar />}
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/search" /> : <LoginPage />}
        />
        <Route
          path="/search"
          element={session ? <SearchPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/collection"
          element={session ? <CollectionPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/wishlist"
          element={session ? <WishlistPage /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={session ? '/search' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
