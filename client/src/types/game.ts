export type GameState = 'idle' | 'playing' | 'finished';

export interface Region {
  id: string;
  name: string;
  startId: number;
  endId: number;
  generationId: number;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  display_name: string;
  region: string;
  score: number;
  time_limit: number;
  created_at: string;
}

export const REGIONS: Region[] = [
  { id: 'kanto', name: 'Kanto', startId: 1, endId: 151, generationId: 1 },
  { id: 'johto', name: 'Johto', startId: 152, endId: 251, generationId: 2 },
  { id: 'hoenn', name: 'Hoenn', startId: 252, endId: 386, generationId: 3 },
  { id: 'sinnoh', name: 'Sinnoh', startId: 387, endId: 493, generationId: 4 },
  { id: 'unova', name: 'Unova', startId: 494, endId: 649, generationId: 5 },
  { id: 'kalos', name: 'Kalos', startId: 650, endId: 721, generationId: 6 },
  { id: 'alola', name: 'Alola', startId: 722, endId: 809, generationId: 7 },
  { id: 'galar', name: 'Galar', startId: 810, endId: 905, generationId: 8 },
  { id: 'paldea', name: 'Paldea', startId: 906, endId: 1025, generationId: 9 },
];
