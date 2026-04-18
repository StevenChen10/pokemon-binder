import { useState, useEffect, useCallback, useRef } from 'react';
import { REGIONS, type Region, type GameState } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PokemonData {
  id: number;
  name: string;
  sprite: string;
}

function getRandomPokemonId(region: Region): number {
  return Math.floor(Math.random() * (region.endId - region.startId + 1)) + region.startId;
}

async function fetchPokemon(id: number): Promise<PokemonData> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
  };
}

export default function WhosThatPokemonPage() {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [guess, setGuess] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [totalRounds] = useState(10);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadNewPokemon = useCallback(async (region: Region) => {
    setLoading(true);
    setRevealed(false);
    setGuess('');
    setFeedback(null);
    try {
      const id = getRandomPokemonId(region);
      const data = await fetchPokemon(id);
      setPokemon(data);
    } catch {
      setPokemon(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const startGame = useCallback((region: Region) => {
    setSelectedRegion(region);
    setGameState('playing');
    setScore(0);
    setRound(1);
    loadNewPokemon(region);
  }, [loadNewPokemon]);

  const handleGuess = useCallback(() => {
    if (!pokemon || !guess.trim()) return;
    const isCorrect = guess.trim().toLowerCase() === pokemon.name.toLowerCase();
    setRevealed(true);
    if (isCorrect) {
      setFeedback('correct');
      setScore(s => s + 1);
    } else {
      setFeedback('wrong');
    }
  }, [pokemon, guess]);

  const handleNext = useCallback(() => {
    if (!selectedRegion) return;
    if (round >= totalRounds) {
      setGameState('finished');
    } else {
      setRound(r => r + 1);
      loadNewPokemon(selectedRegion);
    }
  }, [selectedRegion, round, totalRounds, loadNewPokemon]);

  const handleSkip = useCallback(() => {
    setRevealed(true);
    setFeedback('wrong');
  }, []);

  // Focus input when a new pokemon loads
  useEffect(() => {
    if (!loading && pokemon && !revealed && gameState === 'playing') {
      inputRef.current?.focus();
    }
  }, [loading, pokemon, revealed, gameState]);

  // Region selection screen
  if (gameState === 'idle') {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-pokemon-navy mb-2">Who's That Pokémon?</h1>
          <p className="text-muted-foreground text-lg">Choose a region to start guessing!</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {REGIONS.map(region => (
            <button
              key={region.id}
              onClick={() => startGame(region)}
              className="bg-card border-2 border-border hover:border-pokemon-blue rounded-xl p-5 text-center transition-all hover:shadow-lg hover:-translate-y-0.5 group"
            >
              <div className="text-xl font-black text-pokemon-navy group-hover:text-pokemon-blue transition-colors">
                {region.name}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Gen {region.generationId} &middot; #{region.startId}–{region.endId}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Results screen
  if (gameState === 'finished') {
    const percentage = Math.round((score / totalRounds) * 100);
    let message = 'Better luck next time!';
    if (percentage === 100) message = 'Perfect score! You\'re a Pokémon Master!';
    else if (percentage >= 80) message = 'Amazing! You really know your Pokémon!';
    else if (percentage >= 60) message = 'Great job, trainer!';
    else if (percentage >= 40) message = 'Not bad! Keep training!';

    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h1 className="text-4xl font-black text-pokemon-navy mb-2">Game Over!</h1>
        <p className="text-muted-foreground text-lg mb-6">{selectedRegion?.name} Region</p>
        <div className="bg-card border-2 border-border rounded-2xl p-8 mb-6">
          <div className="text-6xl font-black text-pokemon-navy mb-2">
            {score}/{totalRounds}
          </div>
          <div className="text-lg text-muted-foreground mb-4">{percentage}% correct</div>
          <p className="text-xl font-bold text-pokemon-blue">{message}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => startGame(selectedRegion!)}
            className="bg-pokemon-blue hover:bg-pokemon-navy text-white font-bold rounded-full px-6"
          >
            Play Again
          </Button>
          <Button
            variant="outline"
            onClick={() => { setGameState('idle'); setSelectedRegion(null); }}
            className="font-bold rounded-full px-6"
          >
            Change Region
          </Button>
        </div>
      </div>
    );
  }

  // Playing screen
  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => { setGameState('idle'); setSelectedRegion(null); }}
          className="text-sm text-muted-foreground hover:text-foreground font-bold transition"
        >
          &larr; Regions
        </button>
        <div className="text-sm font-bold text-muted-foreground">
          {selectedRegion?.name} Region
        </div>
        <div className="text-sm font-bold text-pokemon-navy">
          Round {round}/{totalRounds}
        </div>
      </div>

      <div className="bg-card border-2 border-border rounded-2xl p-6 text-center">
        <h2 className="text-2xl font-black text-pokemon-navy mb-4">Who's That Pokémon?</h2>

        {/* Pokemon image area */}
        <div className="relative w-64 h-64 mx-auto mb-6 flex items-center justify-center">
          {loading ? (
            <div className="w-48 h-48 rounded-full bg-muted animate-pulse" />
          ) : pokemon?.sprite ? (
            <img
              src={pokemon.sprite}
              alt={revealed ? pokemon.name : "Who's that Pokémon?"}
              className="w-full h-full object-contain transition-all duration-500"
              style={{
                filter: revealed ? 'none' : 'brightness(0) drop-shadow(0 0 8px rgba(59,130,246,0.5))',
              }}
              draggable={false}
            />
          ) : (
            <div className="text-muted-foreground">Failed to load Pokémon</div>
          )}
        </div>

        {/* Feedback / Answer */}
        {revealed && pokemon && (
          <div className={`mb-4 text-lg font-black ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
            {feedback === 'correct' ? (
              <>Correct! It's {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}!</>
            ) : (
              <>It's {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}!</>
            )}
          </div>
        )}

        {/* Input area */}
        {!revealed ? (
          <form onSubmit={e => { e.preventDefault(); handleGuess(); }} className="flex gap-2">
            <Input
              ref={inputRef}
              value={guess}
              onChange={e => setGuess(e.target.value)}
              placeholder="Enter Pokémon name..."
              disabled={loading}
              className="text-center font-bold text-lg"
            />
            <Button
              type="submit"
              disabled={loading || !guess.trim()}
              className="bg-pokemon-blue hover:bg-pokemon-navy text-white font-bold rounded-lg px-5"
            >
              Guess
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={loading}
              className="font-bold rounded-lg"
            >
              Skip
            </Button>
          </form>
        ) : (
          <Button
            onClick={handleNext}
            className="bg-pokemon-yellow hover:bg-pokemon-yellow/80 text-pokemon-navy font-black rounded-full px-8 text-lg"
          >
            {round >= totalRounds ? 'See Results' : 'Next Pokémon'}
          </Button>
        )}

        {/* Score */}
        <div className="mt-4 text-sm font-bold text-muted-foreground">
          Score: {score}/{round - (revealed ? 0 : 1)}
        </div>
      </div>
    </div>
  );
}
