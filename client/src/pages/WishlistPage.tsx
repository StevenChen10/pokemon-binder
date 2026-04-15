import { useEffect, useState } from 'react';
import { PokemonCard } from '../types/pokemon';
import { getWishlist, removeFromWishlist, getCardById, addToCollection } from '../lib/api';

export default function WishlistPage() {
  const [wishlistCardIds, setWishlistCardIds] = useState<string[]>([]);
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const rows = await getWishlist();
        const ids = rows.map((r) => r.card_id);
        setWishlistCardIds(ids);
        const cardDetails = await Promise.all(ids.map((id) => getCardById(id)));
        setCards(cardDetails);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemove = async (cardId: string) => {
    await removeFromWishlist(cardId);
    setWishlistCardIds((prev) => prev.filter((id) => id !== cardId));
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  const handleMoveToCollection = async (cardId: string) => {
    await addToCollection(cardId);
    await removeFromWishlist(cardId);
    setWishlistCardIds((prev) => prev.filter((id) => id !== cardId));
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setFeedback('Moved to collection!');
    setTimeout(() => setFeedback(null), 2000);
  };

  if (loading) return <p className="p-6 text-gray-500">Loading your wishlist...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Wishlist</h1>
      {feedback && <p className="text-green-600 mb-4">{feedback}</p>}
      {cards.length === 0 ? (
        <p className="text-gray-500">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="border rounded-lg overflow-hidden shadow-sm">
              {card.image && <img src={`${card.image}/low.webp`} alt={card.name} className="w-full" />}
              <div className="p-2">
                <p className="font-semibold text-sm">{card.name}</p>
                <p className="text-xs text-gray-500">{card.set?.name}</p>
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => handleMoveToCollection(card.id)}
                    className="flex-1 text-xs bg-red-600 text-white py-1 rounded hover:bg-red-700"
                  >
                    Got it!
                  </button>
                  <button
                    onClick={() => handleRemove(card.id)}
                    className="flex-1 text-xs bg-gray-200 text-gray-700 py-1 rounded hover:bg-gray-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
