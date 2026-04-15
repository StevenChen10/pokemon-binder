import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-red-600 text-white px-6 py-3 flex items-center justify-between">
      <span className="font-bold text-lg">🃏 Pokémon Binder</span>
      <div className="flex gap-6 items-center">
        <Link to="/search" className="hover:underline">Search</Link>
        <Link to="/collection" className="hover:underline">My Collection</Link>
        <Link to="/wishlist" className="hover:underline">Wishlist</Link>
        <button
          onClick={handleLogout}
          className="bg-white text-red-600 px-3 py-1 rounded font-semibold hover:bg-red-100"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
