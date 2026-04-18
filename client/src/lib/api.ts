import { supabase } from './supabase';
import { PokemonCard, CardSetSummary, TCGPlayerPricing, CollectionCard, WishlistCard } from '../types/pokemon';
import { LeaderboardEntry } from '../types/game';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
const TCGDEX_BASE = 'https://api.tcgdex.net/v2';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh-tw', label: '繁體中文' },
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];

// --- Helper to get auth token for our backend ---
async function getAuthHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// --- TCGdex API ---

export async function searchCards(query: string, lang: LanguageCode = 'en'): Promise<PokemonCard[]> {
  const res = await fetch(`${TCGDEX_BASE}/${lang}/cards?name=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to fetch cards');
  const cards: PokemonCard[] = await res.json();
  return cards.filter(c => !/^(A\d|P-A)/.test(c.id) && c.image);
}

export async function getCardById(id: string, lang: LanguageCode = 'en'): Promise<PokemonCard> {
  const res = await fetch(`${TCGDEX_BASE}/${lang}/cards/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch card ${id}`);
  return res.json();
}

export async function getSets(lang: LanguageCode = 'en'): Promise<CardSetSummary[]> {
  const res = await fetch(`${TCGDEX_BASE}/${lang}/sets`);
  if (!res.ok) throw new Error('Failed to fetch sets');
  const sets: CardSetSummary[] = await res.json();
  return sets.filter(s => !/^(A\d|P-A)/.test(s.id));
}

export async function getTCGPlayerPrices(
  name: string,
  setName?: string,
  localId?: string
): Promise<TCGPlayerPricing | null> {
  const params = new URLSearchParams({ name });
  if (setName) params.set('setName', setName);
  if (localId) params.set('localId', localId);
  const res = await fetch(`${API_BASE}/prices?${params}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getCardsBySet(setId: string, lang: LanguageCode = 'en'): Promise<PokemonCard[]> {
  const res = await fetch(`${TCGDEX_BASE}/${lang}/sets/${setId}`);
  if (!res.ok) throw new Error(`Failed to fetch set ${setId}`);
  const data = await res.json();
  return (data.cards ?? []).filter((c: PokemonCard) => c.image);
}

// --- Collection API ---

export async function getCollection(): Promise<CollectionCard[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/collection`, { headers });
  if (!res.ok) throw new Error('Failed to fetch collection');
  return res.json();
}

export async function addToCollection(cardId: string): Promise<CollectionCard> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/collection`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ card_id: cardId }),
  });
  if (!res.ok) throw new Error('Failed to add card to collection');
  return res.json();
}

export async function removeFromCollection(cardId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/collection/${cardId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Failed to remove card from collection');
}

// --- Wishlist API ---

export async function getWishlist(): Promise<WishlistCard[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/wishlist`, { headers });
  if (!res.ok) throw new Error('Failed to fetch wishlist');
  return res.json();
}

export async function addToWishlist(cardId: string): Promise<WishlistCard> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/wishlist`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ card_id: cardId }),
  });
  if (!res.ok) throw new Error('Failed to add card to wishlist');
  return res.json();
}

export async function removeFromWishlist(cardId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/wishlist/${cardId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Failed to remove card from wishlist');
}

// --- Leaderboard API ---

export async function getLeaderboard(region?: string): Promise<LeaderboardEntry[]> {
  const params = region ? `?region=${encodeURIComponent(region)}` : '';
  const res = await fetch(`${API_BASE}/leaderboard${params}`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function submitScore(data: {
  display_name: string;
  region: string;
  score: number;
  time_limit: number;
}): Promise<LeaderboardEntry> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/leaderboard`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to submit score (${res.status})`);
  }
  return res.json();
}
