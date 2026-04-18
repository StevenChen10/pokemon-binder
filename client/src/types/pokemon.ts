// Shape of a card returned from the TCGdex API
export interface PokemonCard {
  id: string;
  localId: string;
  name: string;
  image?: string;
  hp?: number;
  types?: string[];
  rarity?: string;
  set?: CardSet;
  attacks?: Attack[];
  weaknesses?: Weakness[];
  illustrator?: string;
  lang?: string;
}

export interface CardSet {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
}

export interface CardSetSummary {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  cardCount?: { total: number; official: number };
}

export interface Attack {
  name: string;
  cost: string[];
  damage: string;
  text: string;
}

export interface Weakness {
  type: string;
  value: string;
}

export interface TCGPlayerPricing {
  marketPrice: number | null;
  lowestPrice: number | null;
  productId: number;
  productUrl: string;
}

// Shape of a row in our Supabase collection table
export interface CollectionCard {
  id: string;
  user_id: string;
  card_id: string;
  quantity: number;
  added_at: string;
}

// Shape of a row in our Supabase wishlist table
export interface WishlistCard {
  id: string;
  user_id: string;
  card_id: string;
  added_at: string;
}

