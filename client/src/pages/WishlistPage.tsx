import { useEffect, useState } from 'react';
import { PokemonCard } from '@/types/pokemon';
import { getWishlist, removeFromWishlist, getCardById, addToCollection } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function WishlistPage() {
  const [wishlistCardIds, setWishlistCardIds] = useState<string[]>([]);
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(true);

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
    toast.success('Removed from wishlist');
  };

  const handleMoveToCollection = async (cardId: string) => {
    await addToCollection(cardId);
    await removeFromWishlist(cardId);
    setWishlistCardIds((prev) => prev.filter((id) => id !== cardId));
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    toast.success('Moved to collection!');
  };

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
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-black text-primary">Wishlist</h1>
        <Badge className="bg-pokemon-blue text-white font-black border-0 text-sm">
          {cards.length} cards
        </Badge>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground font-semibold">
          <div className="text-5xl mb-3">⭐</div>
          <p>Your wishlist is empty. Add cards you want!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-card rounded-xl overflow-hidden shadow-sm border-2 border-transparent hover:border-pokemon-blue hover:shadow-lg transition-all"
            >
              {card.image && <img src={`${card.image}/low.webp`} alt={card.name} className="w-full" />}
              <div className="p-2.5">
                <p className="font-bold text-sm text-primary">{card.name}</p>
                <p className="text-xs text-muted-foreground font-semibold">{card.set?.name}</p>
                <div className="flex gap-1.5 mt-2">
                  <Button
                    size="sm"
                    onClick={() => handleMoveToCollection(card.id)}
                    className="flex-1 h-7 text-xs bg-pokemon-yellow text-pokemon-navy font-black hover:brightness-95"
                  >
                    Got it!
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(card.id)}
                    className="flex-1 h-7 text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
