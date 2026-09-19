export type Suits = "coins" | "cups" | "swords" | "clubs";

export type CardValue =
  | "seven"
  | "six"
  | "ace"
  | "five"
  | "four"
  | "three"
  | "two"
  | "jack"
  | "horse"
  | "king";

export interface CardSelections {
  coins: CardValue | null;
  cups: CardValue | null;
  swords: CardValue | null;
  clubs: CardValue | null;
}

export interface Player {
  id: string;
  name: string;
}

export interface GameSettings {
  playerCount: number;
  isTeams?: boolean;
  targetScore: number;
}

export interface RoundRawCounts {
  cards?: number;
  coins?: number;
}

export interface RoundEntry {
  roundNumber: number;
  scope: Record<string, number>; // playerId -> count of scope (sweeps)
  carteWinnerId: string | null; // playerId or null (tie)
  denariWinnerId: string | null; // playerId or null (tie)
  settebelloWinnerId: string | null; // playerId or null
  primieraWinnerId: string | null; // playerId or null (tie)
  roundTotals: Record<string, number>; // points earned in this round per player
  cumulativeTotals: Record<string, number>; // cumulative points up to this round
  rawCounts?: Record<string, RoundRawCounts>;
}

export interface GameState {
  id: string;
  createdAt: number;
  players: Player[];
  settings: GameSettings;
  rounds: RoundEntry[];
  isFinished: boolean;
  winnerId: string | null;
}
