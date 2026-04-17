import { useEffect, useState } from 'react';
import { PokemonCard, CollectionCard, TCGPlayerPricing } from '@/types/pokemon';
import { getCollection, removeFromCollection, getCardById, getTCGPlayerPrices } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function CollectionPage() {
  const [collectionRows, setCollectionRows] = useState<CollectionCard[]>([]);
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [prices, setPrices] = useState<Record<string, TCGPlayerPricing | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const rows = await getCollection();
        setCollectionRows(rows);
        const cardDetails = await Promise.all(rows.map((r) => getCardById(r.card_id)));
        setCards(cardDetails);

        // Fetch prices for all cards
        const priceEntries = await Promise.all(
          cardDetails.map(async (card) => {
            const price = await getTCGPlayerPrices(card.name, card.set?.name, card.localId);
            return [card.id, price] as const;
          })
        );
        setPrices(Object.fromEntries(priceEntries));
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
    setPrices((prev) => {
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
    toast.success('Removed from collection');
  };

  const totalValue = Object.values(prices).reduce((sum, p) => sum + (p?.marketPrice ?? 0), 0);

  if (loading) return (
    <div className="max-w-5xl mx-auto p-6">
      <Skeleton className="h-9 w-48 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl overflow-hidden shadow-sm">
            <Skeleton className="w-full aspect-[2.5/3.5]" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <h1 className="text-3xl font-black text-primary">My Collection</h1>
        <Badge className="bg-pokemon-yellow text-pokemon-navy font-black border-0 text-sm">
          {cards.length} cards
        </Badge>
        {totalValue > 0 && (
          <Badge className="bg-pokemon-navy text-white font-black border-0 text-sm">
            Total: ${totalValue.toFixed(2)}
          </Badge>
        )}
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground font-semibold">
          <div className="text-5xl mb-3">📭</div>
          <p>No cards yet. Search for some to add!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-card rounded-xl overflow-hidden shadow-sm border-2 border-transparent hover:border-pokemon-yellow hover:shadow-lg transition-all"
            >
              {card.image && <img src={`${card.image}/low.webp`} alt={card.name} className="w-full" />}
              <div className="p-2.5">
                <p className="font-bold text-sm text-primary">{card.name}</p>
                <p className="text-xs text-muted-foreground font-semibold">{card.set?.name}</p>
                {prices[card.id]?.marketPrice != null && (
                  <p className="text-sm font-black text-pokemon-navy mt-1">
                    ${prices[card.id]!.marketPrice!.toFixed(2)}
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(card.id)}
                  className="mt-2 w-full h-7 text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
