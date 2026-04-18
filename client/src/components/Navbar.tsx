import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navLink = (to: string, label: string) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`px-4 py-1.5 rounded-full font-bold text-sm transition ${
          active
            ? 'bg-pokemon-yellow text-pokemon-navy'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="bg-pokemon-navy border-b-4 border-pokemon-yellow px-6 py-3 flex items-center justify-between">
      <Link to="/search" className="flex items-center gap-2">
        <svg viewBox="0 0 100 100" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="ball-top" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ff4444" />
              <stop offset="40%" stopColor="#cc0000" />
              <stop offset="100%" stopColor="#8b0000" />
            </radialGradient>
            <radialGradient id="ball-bottom" cx="40%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#e8e8e8" />
              <stop offset="100%" stopColor="#b0b0b0" />
            </radialGradient>
            <radialGradient id="ball-shine" cx="30%" cy="25%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.8" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="btn-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f0f0f0" />
              <stop offset="60%" stopColor="#d0d0d0" />
              <stop offset="100%" stopColor="#a0a0a0" />
            </radialGradient>
          </defs>
          {/* Bottom white half */}
          <circle cx="50" cy="50" r="47" fill="url(#ball-bottom)" />
          {/* Top red half */}
          <path d="M3 50 A47 47 0 0 1 97 50 Z" fill="url(#ball-top)" />
          {/* Center band */}
          <rect x="3" y="46" width="94" height="8" fill="#2a2a2a" rx="1" />
          {/* Center button outer ring */}
          <circle cx="50" cy="50" r="14" fill="#3a3a3a" />
          <circle cx="50" cy="50" r="11" fill="url(#btn-grad)" stroke="#555" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="6" fill="white" stroke="#888" strokeWidth="1" />
          {/* Shine/highlight */}
          <ellipse cx="36" cy="30" rx="18" ry="14" fill="url(#ball-shine)" />
          {/* Outer edge shadow */}
          <circle cx="50" cy="50" r="47" fill="none" stroke="#333" strokeWidth="3" opacity="0.3" />
        </svg>
        <span className="font-black text-pokemon-yellow text-xl tracking-wide">Pokémon Binder</span>
      </Link>
      <div className="flex gap-2 items-center">
        {navLink('/search', 'Search')}
        {navLink('/collection', 'Collection')}
        {navLink('/wishlist', 'Wishlist')}
        {navLink('/whos-that-pokemon', "Who's That?")}
        <Button
          variant="destructive"
          size="sm"
          onClick={handleLogout}
          className="ml-2 rounded-full font-bold"
        >
          Logout
        </Button>
      </div>
    </nav>
  );
}
