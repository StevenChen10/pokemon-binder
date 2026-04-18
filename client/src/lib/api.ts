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

// Map PokeAPI language codes to TCGdex language codes
const POKEAPI_TO_TCGDEX: Record<string, LanguageCode> = {
  en: 'en',
  fr: 'fr',
  es: 'es',
  it: 'it',
  pt: 'pt',
  de: 'de',
  ja: 'ja',
  ko: 'ko',
  'zh-Hant': 'zh-tw',
};

async function getTranslatedNames(englishName: string): Promise<Map<LanguageCode, string>> {
  const names = new Map<LanguageCode, string>();
  names.set('en', englishName);

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${englishName.toLowerCase()}`);
    if (!res.ok) return names;
    const data = await res.json();
    for (const entry of data.names) {
      const tcgCode = POKEAPI_TO_TCGDEX[entry.language.name];
      if (tcgCode) {
        names.set(tcgCode, entry.name);
      }
    }
  } catch {
    // If PokeAPI lookup fails, just search with the English name
  }

  return names;
}

export async function searchCards(query: string, lang?: LanguageCode): Promise<PokemonCard[]> {
  // Get translated names for the search query
  const translatedNames = await getTranslatedNames(query.trim());

  if (lang) {
    const searchName = translatedNames.get(lang) || query;
    const res = await fetch(`${TCGDEX_BASE}/${lang}/cards?name=${encodeURIComponent(searchName)}`);
    if (!res.ok) throw new Error('Failed to fetch cards');
    const cards: PokemonCard[] = await res.json();
    return cards.filter(c => !/^(A\d|P-A)/.test(c.id) && c.image).map(c => ({ ...c, lang }));
  }

  // Search all languages in parallel using translated names
  const results = await Promise.allSettled(
    LANGUAGES.map(async ({ code }) => {
      const searchName = translatedNames.get(code) || query;
      const res = await fetch(`${TCGDEX_BASE}/${code}/cards?name=${encodeURIComponent(searchName)}`);
      if (!res.ok) return [];
      const cards: PokemonCard[] = await res.json();
      return cards
        .filter(c => !/^(A\d|P-A)/.test(c.id) && c.image)
        .map(c => ({ ...c, lang: code }));
    })
  );

  const allCards: PokemonCard[] = [];
  const seen = new Set<string>();
  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const card of result.value) {
        const key = `${card.id}-${card.lang}`;
        if (!seen.has(key)) {
          seen.add(key);
          allCards.push(card);
        }
      }
    }
  }
  return allCards;
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
