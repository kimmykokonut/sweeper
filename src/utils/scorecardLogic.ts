import type {
  Player,
  RoundEntry,
} from "../types";

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
 * Auto-fill and remainder calculation helper for captured cards count (total 40).
 * Handles:
 * - 2-player direct balance: entering count for player 1 auto-fills (40 - count) for player 2.
 * - 3+ player remainder: when (N - 1) players have counts, auto-fills the remaining player.
 * - Clearing/deleting: resets pair in 2-player or clears stale auto-filled player in 3+ players.
 */
export function calculateAutoFillCards(
  currentCounts: Record<string, number | undefined>,
  playerId: string,
  val: string,
  playerIds: string[],
  currentAutoFilledId: string | null,
): {
  updatedCounts: Record<string, number | undefined>;
  autoFilledId: string | null;
  carteWinnerId: string | "tie" | null;
} {
  // 1. Deletion / empty string
  if (val === "") {
    const updated: Record<string, number | undefined> = { ...currentCounts };
    updated[playerId] = undefined;

    if (playerIds.length === 2) {
      const otherId = playerIds.find((id) => id !== playerId);
      if (otherId) updated[otherId] = undefined;
      return {
        updatedCounts: updated,
        autoFilledId: null,
        carteWinnerId: null,
      };
    }

    if (currentAutoFilledId) {
      updated[currentAutoFilledId] = undefined;
    }

    const counts: Record<string, number> = {};
    for (const id of playerIds) {
      if (updated[id] !== undefined) counts[id] = updated[id]!;
    }

    return {
      updatedCounts: updated,
      autoFilledId: null,
      carteWinnerId:
        Object.keys(counts).length > 0
          ? determineWinnerFromCounts(counts) ?? "tie"
          : null,
    };
  }

  // 2. Numeric input
  const parsed = parseInt(val, 10);
  if (isNaN(parsed)) {
    return {
      updatedCounts: currentCounts,
      autoFilledId: currentAutoFilledId,
      carteWinnerId: null,
    };
  }

  if (playerIds.length === 2) {
    const clamped = Math.min(40, Math.max(0, parsed));
    const otherId = playerIds.find((id) => id !== playerId)!;
    const otherRemainder = 40 - clamped;

    const updated: Record<string, number | undefined> = {
      ...currentCounts,
      [playerId]: clamped,
      [otherId]: otherRemainder,
    };

    return {
      updatedCounts: updated,
      autoFilledId: otherId,
      carteWinnerId:
        determineWinnerFromCounts({
          [playerId]: clamped,
          [otherId]: otherRemainder,
        }) ?? "tie",
    };
  }

  // 3+ players
  const otherManualCards = playerIds
    .filter((id) => id !== playerId && id !== currentAutoFilledId)
    .reduce((sum, id) => sum + (currentCounts[id] || 0), 0);

  const maxAllowed = Math.max(0, 40 - otherManualCards);
  const clamped = Math.min(maxAllowed, Math.max(0, parsed));

  const updated: Record<string, number | undefined> = {
    ...currentCounts,
    [playerId]: clamped,
  };

  if (currentAutoFilledId && currentAutoFilledId !== playerId) {
    updated[currentAutoFilledId] = undefined;
  }

  let newAutoFilledId: string | null = null;
  const filledPlayers = playerIds.filter((id) => updated[id] !== undefined);

  if (filledPlayers.length === playerIds.length - 1) {
    const unfilledId = playerIds.find((id) => updated[id] === undefined);
    if (unfilledId) {
      const sumManual = filledPlayers.reduce(
        (sum, id) => sum + (updated[id] || 0),
        0,
      );
      const remainder = Math.max(0, 40 - sumManual);
      updated[unfilledId] = remainder;
      newAutoFilledId = unfilledId;
    }
  }

  const counts: Record<string, number> = {};
  for (const id of playerIds) {
    if (updated[id] !== undefined) counts[id] = updated[id]!;
  }

  return {
    updatedCounts: updated,
    autoFilledId: newAutoFilledId,
    carteWinnerId:
      Object.keys(counts).length > 0
        ? determineWinnerFromCounts(counts) ?? "tie"
        : null,
  };
}
