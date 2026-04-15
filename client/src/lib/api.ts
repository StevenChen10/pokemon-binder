import { supabase } from './supabase';
import { PokemonCard, CardSetSummary, TCGPlayerPricing, CollectionCard, WishlistCard } from '../types/pokemon';

const API_BASE = 'http://localhost:3000/api';
const TCGDEX_BASE = 'https://api.tcgdex.net/v2/en';

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

export async function searchCards(query: string): Promise<PokemonCard[]> {
  const res = await fetch(`${TCGDEX_BASE}/cards?name=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to fetch cards');
  return res.json();
}

export async function getCardById(id: string): Promise<PokemonCard> {
  const res = await fetch(`${TCGDEX_BASE}/cards/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch card ${id}`);
  return res.json();
}

export async function getSets(): Promise<CardSetSummary[]> {
  const res = await fetch(`${TCGDEX_BASE}/sets`);
  if (!res.ok) throw new Error('Failed to fetch sets');
  const sets: CardSetSummary[] = await res.json();
  return sets.filter(s => !/^A\d/.test(s.id));
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

export async function getCardsBySet(setId: string): Promise<PokemonCard[]> {
  const res = await fetch(`${TCGDEX_BASE}/sets/${setId}`);
  if (!res.ok) throw new Error(`Failed to fetch set ${setId}`);
  const data = await res.json();
  return data.cards ?? [];
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
