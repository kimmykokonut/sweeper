import type { GameState, Player, RoundEntry } from "../types";

const STORAGE_KEY = "sweeper_active_game";

/**
 * Calculates points scored by each player in a single round
 */
export function calculateRoundTotals(
  round: Omit<RoundEntry, "roundTotals" | "cumulativeTotals">,
  players: Player[],
): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const player of players) {
    let points = round.scope[player.id] || 0;
    if (round.carteWinnerId === player.id) points += 1;
    if (round.denariWinnerId === player.id) points += 1;
    if (round.settebelloWinnerId === player.id) points += 1;
    if (round.primieraWinnerId === player.id) points += 1;
    totals[player.id] = points;
  }

  return totals;
}

/**
 * Recalculates roundTotals and cumulativeTotals for all rounds in order,
 * and determines if a winner has been reached.
 */
export function recalculateGame(
  rounds: Array<
    Omit<RoundEntry, "roundTotals" | "cumulativeTotals"> &
      Partial<Pick<RoundEntry, "roundTotals" | "cumulativeTotals">>
  >,
  players: Player[],
  targetScore: number,
): {
  recalculatedRounds: RoundEntry[];
  isFinished: boolean;
  winnerId: string | null;
} {
  const recalculatedRounds: RoundEntry[] = [];
  const currentCumulative: Record<string, number> = {};

  // Initialize cumulative scores to 0
  for (const player of players) {
    currentCumulative[player.id] = 0;
  }

  for (let i = 0; i < rounds.length; i++) {
    const rawRound = rounds[i];
    const roundTotals = calculateRoundTotals(rawRound, players);

    for (const player of players) {
      currentCumulative[player.id] =
        (currentCumulative[player.id] || 0) + (roundTotals[player.id] || 0);
    }

    recalculatedRounds.push({
      ...rawRound,
      roundNumber: i + 1,
      roundTotals,
      cumulativeTotals: { ...currentCumulative },
    });
  }

  // Determine game status
  let isFinished = false;
  let winnerId: string | null = null;

  if (recalculatedRounds.length > 0) {
    const finalScores = players.map((p) => ({
      id: p.id,
      score: currentCumulative[p.id] || 0,
    }));

    // Find highest score
    finalScores.sort((a, b) => b.score - a.score);
    const topScore = finalScores[0]?.score ?? 0;
    const secondScore = finalScores[1]?.score ?? -1;

    // A player wins if they reach or exceed targetScore AND have strictly more points than anyone else
    if (topScore >= targetScore && topScore > secondScore) {
      isFinished = true;
      winnerId = finalScores[0].id;
    }
  }

  return {
    recalculatedRounds,
    isFinished,
    winnerId,
  };
}

/**
 * Determines winner from count entries (e.g. 21 cards vs 19 cards).
 * Returns playerId if one player strictly has more, or null if tie.
 */
export function determineWinnerFromCounts(
  counts: Record<string, number>,
): string | null {
  const entries = Object.entries(counts).filter(
    ([, count]) => !isNaN(count) && count > 0,
  );
  if (entries.length === 0) return null;

  entries.sort((a, b) => b[1] - a[1]);
  if (entries.length > 1 && entries[0][1] === entries[1][1]) {
    return null; // Tie
  }
  return entries[0][0];
}

/**
 * LocalStorage helpers
 */
export function saveGameState(game: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
  } catch (err) {
    console.error("Failed to save game state to localStorage", err);
  }
}

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch (err) {
    console.error("Failed to load game state from localStorage", err);
    return null;
  }
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear game state from localStorage", err);
  }
}
