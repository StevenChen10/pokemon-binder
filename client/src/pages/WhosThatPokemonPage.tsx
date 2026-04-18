import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { REGIONS, type Region, type GameState, type LeaderboardEntry } from '@/types/game';
import { getLeaderboard, submitScore } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TIME_LIMIT = 30;

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

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function WhosThatPokemonPage() {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardRegion, setLeaderboardRegion] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load leaderboard for a region
  const loadLeaderboard = useCallback(async (regionId?: string) => {
    try {
      const data = await getLeaderboard(regionId);
      setLeaderboard(data);
    } catch {
      setLeaderboard([]);
    }
  }, []);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setGameState('finished');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Load leaderboard when game ends
  useEffect(() => {
    if (gameState === 'finished' && selectedRegion) {
      loadLeaderboard(selectedRegion.id);
    }
  }, [gameState, selectedRegion, loadLeaderboard]);

  const loadNewPokemon = useCallback(async (region: Region) => {
    setLoading(true);
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
    setTimeLeft(TIME_LIMIT);
    setSubmitted(false);
    setDisplayName('');
    loadNewPokemon(region);
  }, [loadNewPokemon]);

  const handleGuess = useCallback(() => {
    if (!pokemon || !guess.trim() || gameState !== 'playing') return;
    const isCorrect = guess.trim().toLowerCase() === pokemon.name.toLowerCase();
    if (isCorrect) {
      setFeedback('correct');
      setScore(s => s + 1);
      // Immediately load next pokemon after correct guess
      if (selectedRegion) {
        setTimeout(() => {
          setFeedback(null);
          loadNewPokemon(selectedRegion);
        }, 600);
      }
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 400);
    }
    setGuess('');
  }, [pokemon, guess, gameState, selectedRegion, loadNewPokemon]);

  const handleSkip = useCallback(() => {
    if (!selectedRegion || gameState !== 'playing') return;
    setFeedback(null);
    loadNewPokemon(selectedRegion);
  }, [selectedRegion, gameState, loadNewPokemon]);

  const handleSubmitScore = useCallback(async () => {
    if (!selectedRegion || !displayName.trim() || submitted) return;
    setSubmitting(true);
    try {
      await submitScore({
        display_name: displayName.trim(),
        region: selectedRegion.id,
        score,
        time_limit: TIME_LIMIT,
      });
      setSubmitted(true);
      toast.success('Score submitted!');
      loadLeaderboard(selectedRegion.id);
    } catch (err) {
      toast.error('Failed to submit score. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedRegion, displayName, score, submitted, loadLeaderboard]);

  // Focus input when a new pokemon loads
  useEffect(() => {
    if (!loading && pokemon && gameState === 'playing') {
      inputRef.current?.focus();
    }
  }, [loading, pokemon, gameState]);

  // Leaderboard view (standalone)
  if (showLeaderboard) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowLeaderboard(false)}
            className="text-sm text-muted-foreground hover:text-foreground font-bold transition"
          >
            &larr; Back
          </button>
          <h1 className="text-2xl font-black text-pokemon-navy">Leaderboard</h1>
          <div className="w-12" />
        </div>

        {/* Region filter */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <button
            onClick={() => { setLeaderboardRegion(''); loadLeaderboard(); }}
            className={`px-3 py-1 rounded-full text-sm font-bold transition ${
              !leaderboardRegion
                ? 'bg-pokemon-navy text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          {REGIONS.map(r => (
            <button
              key={r.id}
              onClick={() => { setLeaderboardRegion(r.id); loadLeaderboard(r.id); }}
              className={`px-3 py-1 rounded-full text-sm font-bold transition ${
                leaderboardRegion === r.id
                  ? 'bg-pokemon-navy text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        <LeaderboardTable entries={leaderboard} />
      </div>
    );
  }

  // Region selection screen
  if (gameState === 'idle') {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-pokemon-navy mb-2">Who's That Pokémon?</h1>
          <p className="text-muted-foreground text-lg mb-4">
            Guess as many Pokémon as you can in {TIME_LIMIT} seconds!
          </p>
          <button
            onClick={() => { setShowLeaderboard(true); loadLeaderboard(); }}
            className="text-pokemon-blue hover:text-pokemon-navy font-bold text-sm underline underline-offset-2 transition"
          >
            View Leaderboard
          </button>
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
    return (
      <div className="max-w-xl mx-auto p-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-pokemon-navy mb-2">Time's Up!</h1>
          <p className="text-muted-foreground text-lg">{selectedRegion?.name} Region</p>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-8 mb-6 text-center">
          <div className="text-6xl font-black text-pokemon-navy mb-1">{score}</div>
          <div className="text-lg text-muted-foreground mb-6">
            Pokémon guessed in {TIME_LIMIT}s
          </div>

          {/* Submit score */}
          {!submitted ? (
            <form onSubmit={e => { e.preventDefault(); handleSubmitScore(); }} className="flex gap-2 max-w-xs mx-auto mb-4">
              <Input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your name..."
                className="text-center font-bold"
                maxLength={20}
              />
              <Button
                type="submit"
                disabled={!displayName.trim() || submitting}
                className="bg-pokemon-yellow hover:bg-pokemon-yellow/80 text-pokemon-navy font-black rounded-lg px-5"
              >
                {submitting ? '...' : 'Submit'}
              </Button>
            </form>
          ) : (
            <p className="text-green-600 font-bold mb-4">Score submitted!</p>
          )}

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

        {/* Leaderboard */}
        <div>
          <h2 className="text-xl font-black text-pokemon-navy mb-3 text-center">
            {selectedRegion?.name} Leaderboard
          </h2>
          <LeaderboardTable entries={leaderboard} />
        </div>
      </div>
    );
  }

  // Playing screen
  const timerColor = timeLeft <= 5 ? 'text-red-500' : timeLeft <= 10 ? 'text-pokemon-yellow' : 'text-pokemon-navy';

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            setGameState('idle');
            setSelectedRegion(null);
          }}
          className="text-sm text-muted-foreground hover:text-foreground font-bold transition"
        >
          &larr; Quit
        </button>
        <div className="text-sm font-bold text-muted-foreground">
          {selectedRegion?.name}
        </div>
        <div className={`text-2xl font-black tabular-nums ${timerColor} ${timeLeft <= 5 ? 'animate-pulse' : ''}`}>
          {timeLeft}s
        </div>
      </div>

      <div className="bg-card border-2 border-border rounded-2xl p-6 text-center">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black text-pokemon-navy">Who's That Pokémon?</h2>
          <div className="text-lg font-black text-pokemon-blue">{score} pts</div>
        </div>

        {/* Pokemon image area */}
        <div className="relative w-64 h-64 mx-auto mb-6 flex items-center justify-center">
          {loading ? (
            <div className="w-48 h-48 rounded-full bg-muted animate-pulse" />
          ) : pokemon?.sprite ? (
            <img
              src={pokemon.sprite}
              alt="Who's that Pokémon?"
              className={`w-full h-full object-contain transition-all duration-300 ${
                feedback === 'correct' ? 'scale-110' : ''
              }`}
              style={{
                filter: feedback === 'correct'
                  ? 'none'
                  : 'brightness(0) drop-shadow(0 0 8px rgba(59,130,246,0.5))',
              }}
              draggable={false}
            />
          ) : (
            <div className="text-muted-foreground">Failed to load</div>
          )}

          {/* Quick feedback flash */}
          {feedback === 'correct' && pokemon && (
            <div className="absolute bottom-0 left-0 right-0 text-green-600 font-black text-lg">
              {capitalize(pokemon.name)}!
            </div>
          )}
        </div>

        {/* Input area */}
        <form onSubmit={e => { e.preventDefault(); handleGuess(); }} className="flex gap-2">
          <Input
            ref={inputRef}
            value={guess}
            onChange={e => setGuess(e.target.value)}
            placeholder="Enter Pokémon name..."
            disabled={loading}
            className={`text-center font-bold text-lg transition-colors ${
              feedback === 'wrong' ? 'border-red-400 bg-red-50' : ''
            }`}
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
      </div>
    </div>
  );
}

function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No scores yet. Be the first!
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-border bg-muted/50">
            <th className="text-left px-4 py-3 text-sm font-black text-pokemon-navy">#</th>
            <th className="text-left px-4 py-3 text-sm font-black text-pokemon-navy">Trainer</th>
            <th className="text-left px-4 py-3 text-sm font-black text-pokemon-navy">Region</th>
            <th className="text-right px-4 py-3 text-sm font-black text-pokemon-navy">Score</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={entry.id} className={`border-b border-border last:border-0 ${i < 3 ? 'bg-pokemon-yellow/10' : ''}`}>
              <td className="px-4 py-3 font-black text-pokemon-navy">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </td>
              <td className="px-4 py-3 font-bold">{entry.display_name}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{entry.region}</td>
              <td className="px-4 py-3 text-right font-black text-pokemon-blue">{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
