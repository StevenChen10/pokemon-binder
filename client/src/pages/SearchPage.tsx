import { useState } from 'react';
import { PokemonCard, CardSetSummary, TCGPlayerPricing } from '../types/pokemon';
import { searchCards, getSets, getCardsBySet, getCardById, getTCGPlayerPrices, addToCollection, addToWishlist } from '../lib/api';

type Tab = 'cards' | 'sets';

export default function SearchPage() {
  const [tab, setTab] = useState<Tab>('cards');

  // Cards tab state
  const [query, setQuery] = useState('');
  const [cardResults, setCardResults] = useState<PokemonCard[]>([]);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  // Sets tab state
  const [sets, setSets] = useState<CardSetSummary[]>([]);
  const [setsLoading, setSetsLoading] = useState(false);
  const [setsError, setSetsError] = useState<string | null>(null);
  const [selectedSet, setSelectedSet] = useState<CardSetSummary | null>(null);
  const [setCards, setSetCards] = useState<PokemonCard[]>([]);
  const [setCardsLoading, setSetCardsLoading] = useState(false);

  const [feedback, setFeedback] = useState<string | null>(null);

  // Card detail modal
  const [modalCard, setModalCard] = useState<PokemonCard | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [tcgPrices, setTcgPrices] = useState<TCGPlayerPricing | null>(null);

  const handleCardClick = async (card: PokemonCard) => {
    setModalCard(card);
    setTcgPrices(null);
    setModalLoading(true);
    try {
      const full = await getCardById(card.id);
      setModalCard(full);
      const prices = await getTCGPlayerPrices(full.name, full.set?.name, full.localId);
      setTcgPrices(prices);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCardSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setCardLoading(true);
    setCardError(null);
    try {
      setCardResults(await searchCards(query));
    } catch {
      setCardError('Failed to search cards. Try again.');
    } finally {
      setCardLoading(false);
    }
  };

  const handleTabChange = async (next: Tab) => {
    setTab(next);
    if (next === 'sets' && sets.length === 0) {
      setSetsLoading(true);
      setSetsError(null);
      try {
        setSets(await getSets());
      } catch {
        setSetsError('Failed to load sets. Try again.');
      } finally {
        setSetsLoading(false);
      }
    }
  };

  const handleSetClick = async (set: CardSetSummary) => {
    setSelectedSet(set);
    setSetCards([]);
    setSetCardsLoading(true);
    try {
      setSetCards(await getCardsBySet(set.id));
    } finally {
      setSetCardsLoading(false);
    }
  };

  const handleAdd = async (cardId: string, type: 'collection' | 'wishlist') => {
    try {
      if (type === 'collection') await addToCollection(cardId);
      else await addToWishlist(cardId);
      setFeedback(`Added to ${type}!`);
      setTimeout(() => setFeedback(null), 2000);
    } catch {
      setFeedback('Something went wrong.');
    }
  };

  const cardGrid = (cards: PokemonCard[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
          {card.image && (
            <img
              src={`${card.image}/low.webp`}
              alt={card.name}
              className="w-full cursor-pointer"
              onClick={() => handleCardClick(card)}
            />
          )}
          <div className="p-2">
            <p className="font-semibold text-sm">{card.name}</p>
            <p className="text-xs text-gray-500">{card.set?.name}{card.localId ? ` · #${card.localId}` : ''}</p>
            <div className="flex gap-1 mt-2">
              <button
                onClick={() => handleAdd(card.id, 'collection')}
                className="flex-1 text-xs bg-red-600 text-white py-1 rounded hover:bg-red-700"
              >
                + Collection
              </button>
              <button
                onClick={() => handleAdd(card.id, 'wishlist')}
                className="flex-1 text-xs bg-gray-200 text-gray-700 py-1 rounded hover:bg-gray-300"
              >
                + Wishlist
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );


  const modal = modalCard && (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => setModalCard(null)}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-4">
          {modalCard.image && (
            <img src={`${modalCard.image}/high.webp`} alt={modalCard.name} className="w-32 rounded" />
          )}
          <div>
            <h2 className="text-lg font-bold">{modalCard.name}</h2>
            <p className="text-sm text-gray-500">
              {modalCard.set?.name}{modalCard.localId ? ` · #${modalCard.localId}` : ''}
            </p>
            {modalCard.rarity && <p className="text-xs text-gray-400 mt-1">{modalCard.rarity}</p>}
          </div>
        </div>

        {modalLoading && <p className="text-gray-500 text-sm">Loading pricing...</p>}

        {!modalLoading && tcgPrices && (
          <div>
            <h3 className="font-semibold text-sm mb-2">TCGPlayer Pricing (USD)</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {tcgPrices.marketPrice != null && <><span className="text-gray-500">Market</span><span className="font-semibold">${tcgPrices.marketPrice.toFixed(2)}</span></>}
              {tcgPrices.lowestPrice != null && <><span className="text-gray-500">Lowest</span><span>${tcgPrices.lowestPrice.toFixed(2)}</span></>}
            </div>
            <a
              href={tcgPrices.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-red-600 hover:underline mt-2 inline-block"
            >
              View on TCGPlayer →
            </a>
          </div>
        )}

        {!modalLoading && !tcgPrices && (
          <p className="text-xs text-gray-400">No TCGPlayer pricing available for this card.</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => { handleAdd(modalCard.id, 'collection'); setModalCard(null); }}
            className="flex-1 bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 text-sm"
          >
            + Collection
          </button>
          <button
            onClick={() => { handleAdd(modalCard.id, 'wishlist'); setModalCard(null); }}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-semibold hover:bg-gray-300 text-sm"
          >
            + Wishlist
          </button>
        </div>

        <button onClick={() => setModalCard(null)} className="text-xs text-gray-400 hover:underline text-center">
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      {modal}
      <h1 className="text-2xl font-bold mb-4">Search</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => handleTabChange('cards')}
          className={`pb-2 px-4 font-semibold border-b-2 transition ${
            tab === 'cards' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Cards
        </button>
        <button
          onClick={() => handleTabChange('sets')}
          className={`pb-2 px-4 font-semibold border-b-2 transition ${
            tab === 'sets' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Sets
        </button>
      </div>

      {feedback && <p className="text-green-600 mb-4">{feedback}</p>}

      {/* Cards Tab */}
      {tab === 'cards' && (
        <>
          <form onSubmit={handleCardSearch} className="flex gap-2 mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a Pokémon..."
              className="border rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700"
            >
              Search
            </button>
          </form>
          {cardError && <p className="text-red-500 mb-4">{cardError}</p>}
          {cardLoading && <p className="text-gray-500">Searching...</p>}
          {cardGrid(cardResults)}
        </>
      )}

      {/* Sets Tab */}
      {tab === 'sets' && (
        <>
          {setsLoading && <p className="text-gray-500">Loading sets...</p>}
          {setsError && <p className="text-red-500">{setsError}</p>}

          {selectedSet ? (
            <>
              <button
                onClick={() => setSelectedSet(null)}
                className="text-sm text-red-600 hover:underline mb-4 inline-block"
              >
                ← Back to sets
              </button>
              <h2 className="text-xl font-bold mb-4">{selectedSet.name}</h2>
              {setCardsLoading && <p className="text-gray-500">Loading cards...</p>}
              {cardGrid(setCards)}
            </>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {sets.map((set) => (
                <button
                  key={set.id}
                  onClick={() => handleSetClick(set)}
                  className="border rounded-lg p-3 flex flex-col items-center gap-2 hover:shadow-md transition text-center"
                >
                  {set.logo ? (
                    <img src={`${set.logo}.webp`} alt={set.name} className="h-12 object-contain" />
                  ) : (
                    <div className="h-12 flex items-center justify-center text-gray-300 text-2xl">🃏</div>
                  )}
                  <p className="text-sm font-semibold">{set.name}</p>
                  {set.cardCount && (
                    <p className="text-xs text-gray-500">{set.cardCount.official} cards</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
