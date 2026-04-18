import { useState } from 'react';
import { toast } from 'sonner';
import { PokemonCard, CardSetSummary, TCGPlayerPricing } from '@/types/pokemon';
import { searchCards, getSets, getCardsBySet, getCardById, getTCGPlayerPrices, addToCollection, addToWishlist, LANGUAGES, type LanguageCode } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [langFilter, setLangFilter] = useState<LanguageCode | 'all'>('all');
  const [cardResults, setCardResults] = useState<PokemonCard[]>([]);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const [sets, setSets] = useState<CardSetSummary[]>([]);
  const [setsLoading, setSetsLoading] = useState(false);
  const [selectedSet, setSelectedSet] = useState<CardSetSummary | null>(null);
  const [setCards, setSetCards] = useState<PokemonCard[]>([]);
  const [setCardsLoading, setSetCardsLoading] = useState(false);

  const [modalCard, setModalCard] = useState<PokemonCard | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [tcgPrices, setTcgPrices] = useState<TCGPlayerPricing | null>(null);

  const handleCardClick = async (card: PokemonCard) => {
    setModalCard(card);
    setTcgPrices(null);
    setModalLoading(true);
    try {
      const full = await getCardById(card.id, (card.lang as LanguageCode) || 'en');
      setModalCard({ ...full, lang: card.lang });
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

  const handleSetsLoad = async () => {
    setSetsLoading(true);
    try {
      setSets(await getSets());
    } finally {
      setSetsLoading(false);
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

  const filteredCards = langFilter === 'all'
    ? cardResults
    : cardResults.filter(c => c.lang === langFilter);

  const handleAdd = async (cardId: string, type: 'collection' | 'wishlist') => {
    try {
      if (type === 'collection') await addToCollection(cardId);
      else await addToWishlist(cardId);
      toast.success(`Added to ${type}!`);
    } catch {
      toast.error('Something went wrong.');
    }
  };

  const skeletonGrid = (
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
  );

  const langLabel = (code: string) => LANGUAGES.find(l => l.code === code)?.label ?? code;

  const cardGrid = (cards: PokemonCard[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={`${card.id}-${card.lang || 'en'}`}
          className="bg-card rounded-xl overflow-hidden shadow-sm border-2 border-transparent hover:border-pokemon-yellow hover:shadow-lg transition-all group"
        >
          {card.image && (
            <div className="relative">
              <img
                src={`${card.image}/low.webp`}
                alt={card.name}
                className="w-full cursor-pointer group-hover:scale-[1.02] transition-transform"
                onClick={() => handleCardClick(card)}
              />
              {card.lang && card.lang !== 'en' && (
                <span className="absolute top-1.5 right-1.5 bg-pokemon-navy/90 text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-md uppercase">
                  {card.lang}
                </span>
              )}
            </div>
          )}
          <div className="p-2.5">
            <p className="font-bold text-sm text-primary">{card.name}</p>
            <p className="text-xs text-muted-foreground font-semibold">
              {card.set?.name}{card.localId ? ` · #${card.localId}` : ''}
            </p>
            <div className="flex gap-1.5 mt-2">
              <Button
                size="sm"
                onClick={() => handleAdd(card.id, 'collection')}
                className="flex-1 h-7 text-xs bg-pokemon-yellow text-pokemon-navy font-black hover:brightness-95"
              >
                + Collection
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleAdd(card.id, 'wishlist')}
                className="flex-1 h-7 text-xs font-bold bg-pokemon-blue text-white hover:bg-blue-600"
              >
                + Wishlist
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Card Detail Dialog */}
      <Dialog open={!!modalCard} onOpenChange={(open) => !open && setModalCard(null)}>
        <DialogContent
          className="border-4 border-pokemon-yellow sm:max-w-md p-0 overflow-hidden"
          backgroundImage={modalCard?.image ? `${modalCard.image}/high.webp` : undefined}
        >
          <DialogHeader className="bg-pokemon-navy px-6 py-4">
            <DialogTitle className="text-white font-black text-lg">
              {modalCard?.name}
            </DialogTitle>
            <DialogDescription className="text-blue-200 font-semibold flex items-center gap-2">
              {modalCard?.set?.name}{modalCard?.localId ? ` · #${modalCard.localId}` : ''}
              {modalCard?.lang && modalCard.lang !== 'en' && (
                <Badge className="bg-pokemon-blue text-white font-black border-0 uppercase text-[0.6rem]">
                  {modalCard.lang}
                </Badge>
              )}
              {modalCard?.rarity && (
                <Badge className="bg-pokemon-yellow text-pokemon-navy font-black border-0">
                  {modalCard.rarity}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 flex flex-col gap-4">
            {modalCard?.image && (
              <img
                src={`${modalCard.image}/high.webp`}
                alt={modalCard.name}
                className="w-44 rounded-xl mx-auto shadow-lg"
              />
            )}

            {/* Card details */}
            {modalCard && (modalCard.hp || modalCard.types?.length) && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {modalCard.hp != null && (
                  <Badge variant="outline" className="font-bold bg-white/80 text-pokemon-navy border-white/50">HP {modalCard.hp}</Badge>
                )}
                {modalCard.types?.map((t) => (
                  <Badge key={t} variant="secondary" className="font-bold bg-white/80 text-pokemon-navy">{t}</Badge>
                ))}
              </div>
            )}

            {/* Pricing */}
            {modalLoading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            )}

            {!modalLoading && tcgPrices && (
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4">
                <p className="font-black text-white text-sm mb-2">TCGPlayer Pricing</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {tcgPrices.marketPrice != null && (
                    <>
                      <span className="text-white/70 font-semibold text-sm">Market</span>
                      <span className="font-black text-white text-lg">${tcgPrices.marketPrice.toFixed(2)}</span>
                    </>
                  )}
                  {tcgPrices.lowestPrice != null && (
                    <>
                      <span className="text-white/70 font-semibold text-sm">Lowest</span>
                      <span className="font-bold text-white text-sm">${tcgPrices.lowestPrice.toFixed(2)}</span>
                    </>
                  )}
                </div>
                <a
                  href={tcgPrices.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-pokemon-yellow font-bold hover:underline mt-2 inline-block"
                >
                  View on TCGPlayer →
                </a>
              </div>
            )}

            {!modalLoading && !tcgPrices && (
              <p className="text-sm text-white/70 text-center font-semibold">
                No pricing available for this card.
              </p>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => { handleAdd(modalCard!.id, 'collection'); setModalCard(null); }}
                className="flex-1 bg-pokemon-yellow text-pokemon-navy font-black hover:brightness-95"
              >
                + Collection
              </Button>
              <Button
                onClick={() => { handleAdd(modalCard!.id, 'wishlist'); setModalCard(null); }}
                className="flex-1 bg-pokemon-blue text-white font-bold hover:bg-blue-600"
              >
                + Wishlist
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <h1 className="text-3xl font-black text-primary mb-6">Search</h1>

      <Tabs defaultValue="cards" onValueChange={(v) => { if (v === 'sets') handleSetsLoad(); }}>
        <TabsList className="mb-6">
          <TabsTrigger value="cards" className="font-black">Cards</TabsTrigger>
          <TabsTrigger value="sets" className="font-black">Sets</TabsTrigger>
        </TabsList>

        <TabsContent value="cards">
          <form onSubmit={handleCardSearch} className="flex gap-2 mb-6">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a Pokémon..."
              className="font-semibold"
            />
            <Button type="submit" className="bg-pokemon-red text-white font-black hover:bg-red-700 px-6">
              Search
            </Button>
          </form>

          {cardError && <p className="text-destructive font-bold mb-4">{cardError}</p>}

          {cardResults.length > 0 && !cardLoading && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button
                onClick={() => setLangFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  langFilter === 'all'
                    ? 'bg-pokemon-navy text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All ({cardResults.length})
              </button>
              {LANGUAGES.filter(l => cardResults.some(c => c.lang === l.code)).map(l => (
                <button
                  key={l.code}
                  onClick={() => setLangFilter(l.code)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    langFilter === l.code
                      ? 'bg-pokemon-navy text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {l.label} ({cardResults.filter(c => c.lang === l.code).length})
                </button>
              ))}
            </div>
          )}

          {cardLoading ? skeletonGrid : cardGrid(filteredCards)}
        </TabsContent>

        <TabsContent value="sets">
          {setsLoading && skeletonGrid}

          {selectedSet ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSet(null)}
                className="mb-4 font-black text-accent"
              >
                ← Back to sets
              </Button>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-black text-primary">{selectedSet.name}</h2>
                {selectedSet.cardCount && (
                  <Badge variant="secondary" className="font-bold">
                    {selectedSet.cardCount.official} cards
                  </Badge>
                )}
              </div>
              {setCardsLoading ? skeletonGrid : cardGrid(setCards)}
            </>
          ) : (
            !setsLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {sets.map((set) => (
                  <button
                    key={set.id}
                    onClick={() => handleSetClick(set)}
                    className="bg-card rounded-xl p-4 flex flex-col items-center gap-2 border-2 border-transparent hover:border-pokemon-yellow hover:shadow-lg transition-all text-center"
                  >
                    {set.logo ? (
                      <img src={`${set.logo}.webp`} alt={set.name} className="h-12 object-contain" />
                    ) : (
                      <div className="h-12 flex items-center justify-center text-3xl">🎴</div>
                    )}
                    <p className="text-sm font-black text-primary">{set.name}</p>
                    {set.cardCount && (
                      <Badge variant="outline" className="font-bold text-xs">
                        {set.cardCount.official} cards
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
