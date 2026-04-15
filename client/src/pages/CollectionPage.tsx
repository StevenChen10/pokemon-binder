import { useEffect, useState } from 'react';
import { PokemonCard, CollectionCard } from '../types/pokemon';
import { getCollection, removeFromCollection, getCardById } from '../lib/api';

export default function CollectionPage() {
  const [collectionRows, setCollectionRows] = useState<CollectionCard[]>([]);
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const rows = await getCollection();
        setCollectionRows(rows);
        // Fetch full card details for each card in the collection
        const cardDetails = await Promise.all(rows.map((r) => getCardById(r.card_id)));
        setCards(cardDetails);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, []);

  const handleRemove = async (cardId: string) => {
    await removeFromCollection(cardId);
    setCollectionRows((prev) => prev.filter((r) => r.card_id !== cardId));
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  if (loading) return <p className="p-6 text-gray-500">Loading your collection...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Collection</h1>
      {cards.length === 0 ? (
        <p className="text-gray-500">No cards yet. Search for some to add!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="border rounded-lg overflow-hidden shadow-sm">
              {card.image && <img src={`${card.image}/low.webp`} alt={card.name} className="w-full" />}
              <div className="p-2">
                <p className="font-semibold text-sm">{card.name}</p>
                <p className="text-xs text-gray-500">{card.set?.name}</p>
                <button
                  onClick={() => handleRemove(card.id)}
                  className="mt-2 w-full text-xs bg-gray-200 text-gray-700 py-1 rounded hover:bg-red-100 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
