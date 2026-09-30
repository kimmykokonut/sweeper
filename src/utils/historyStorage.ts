import type {
  FinishedGame,
  GameState,
  HistoryBackupPayload,
  HistoryValidationResult,
  MatchupSummary,
} from "../types";

export const HISTORY_STORAGE_KEY = "sweeper_game_history";

export function saveFinishedGame(game: GameState): FinishedGame | null {
  if (!game.isFinished) {
    return null;
  }

  const finalScores: Record<string, number> = {};
  const totalScope: Record<string, number> = {};

  for (const p of game.players) {
    finalScores[p.id] = 0;
    totalScope[p.id] = 0;
  }

  if (game.rounds.length > 0) {
    const lastRound = game.rounds[game.rounds.length - 1];
    for (const p of game.players) {
      finalScores[p.id] = lastRound.cumulativeTotals[p.id] ?? 0;
    }
  }

  for (const r of game.rounds) {
    for (const p of game.players) {
      totalScope[p.id] += r.scope[p.id] || 0;
    }
  }

  const history = loadGameHistory();
  const existingIndex = history.findIndex((g) => g.id === game.id);

  const finishedGame: FinishedGame = {
    id: game.id,
    createdAt: game.createdAt,
    completedAt: existingIndex >= 0 ? history[existingIndex].completedAt : Date.now(),
    players: game.players,
    settings: game.settings,
    rounds: game.rounds,
    winnerId: game.winnerId,
    finalScores,
    totalScope,
  };

  let updatedHistory: FinishedGame[];
  if (existingIndex >= 0) {
    // Replace in place
    updatedHistory = [...history];
    updatedHistory[existingIndex] = finishedGame;
  } else {
    // Prepend new finished game
    updatedHistory = [finishedGame, ...history];
  }

  saveGameHistory(updatedHistory);
  return finishedGame;
}

export function saveGameHistory(history: FinishedGame[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.error("Failed to save game history to localStorage", err);
  }
}

export function loadGameHistory(): FinishedGame[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as FinishedGame[];
  } catch (err) {
    console.error("Failed to load game history from localStorage", err);
    return [];
  }
}

export function deleteGameFromHistory(gameId: string): void {
  const history = loadGameHistory();
  const updated = history.filter((g) => g.id !== gameId);
  saveGameHistory(updated);
}

export function clearGameHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear game history from localStorage", err);
  }
}

function isValidFinishedGame(item: unknown): item is FinishedGame {
  if (!item || typeof item !== "object") return false;
  const g = item as Partial<FinishedGame>;
  if (typeof g.id !== "string" || !g.id.trim()) return false;
  if (!Array.isArray(g.players) || g.players.length < 2) return false;
  for (const p of g.players) {
    if (
      !p ||
      typeof p !== "object" ||
      typeof p.id !== "string" ||
      typeof p.name !== "string"
    ) {
      return false;
    }
  }
  if (!Array.isArray(g.rounds)) return false;
  if (!g.finalScores || typeof g.finalScores !== "object") return false;
  if (!g.totalScope || typeof g.totalScope !== "object") return false;
  return true;
}

/**
 * Serializes the games array into a human-readable Sweeper backup JSON string.
 */
export function exportGameHistoryJson(history: FinishedGame[]): string {
  const payload: HistoryBackupPayload = {
    version: 1,
    app: "sweeper",
    exportedAt: Date.now(),
    gameCount: history.length,
    games: history,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Defensively parses and validates raw JSON input from an imported backup file.
 * Accepts either:
 * 1. A Sweeper backup payload object: { app: "sweeper", games: [...] }
 * 2. A direct array of FinishedGame objects: [...]
 */
export function parseAndValidateHistoryBackup(
  rawJson: string,
): HistoryValidationResult {
  try {
    const parsed = JSON.parse(rawJson);
    let candidateGames: unknown[] = [];

    if (Array.isArray(parsed)) {
      candidateGames = parsed;
    } else if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as { games?: unknown[] }).games)
    ) {
      candidateGames = (parsed as { games: unknown[] }).games;
    } else {
      return {
        isValid: false,
        games: [],
        error:
          "Unrecognized backup format. Please select a valid Sweeper backup file.",
      };
    }

    if (candidateGames.length === 0) {
      return {
        isValid: true,
        games: [],
      };
    }

    const validGames: FinishedGame[] = [];
    for (const item of candidateGames) {
      if (isValidFinishedGame(item)) {
        validGames.push({
          ...item,
          createdAt:
            typeof item.createdAt === "number" && !isNaN(item.createdAt)
              ? item.createdAt
              : Date.now(),
          completedAt:
            typeof item.completedAt === "number" && !isNaN(item.completedAt)
              ? item.completedAt
              : Date.now(),
          settings: item.settings || {
            playerCount: item.players.length,
            targetScore: 11,
          },
          winnerId: item.winnerId ?? null,
        });
      }
    }

    if (validGames.length === 0) {
      return {
        isValid: false,
        games: [],
        error: "No valid Sweeper game records found in file.",
      };
    }

    return {
      isValid: true,
      games: validGames,
    };
  } catch {
    return {
      isValid: false,
      games: [],
      error: "Could not parse JSON. The file might be corrupted.",
    };
  }
}

/**
 * Merges imported games into current history.
 * Existing games matching game.id are skipped to prevent duplicates.
 * Returns the merged list sorted by completedAt (most recent first).
 */
export function mergeGameHistories(
  currentHistory: FinishedGame[],
  importedGames: FinishedGame[],
): {
  merged: FinishedGame[];
  addedCount: number;
  duplicateCount: number;
} {
  const existingIds = new Set(currentHistory.map((g) => g.id));
  const newGames: FinishedGame[] = [];
  let duplicateCount = 0;

  for (const game of importedGames) {
    if (existingIds.has(game.id)) {
      duplicateCount += 1;
    } else {
      newGames.push(game);
      existingIds.add(game.id);
    }
  }

  const merged = [...newGames, ...currentHistory].sort(
    (a, b) => (b.completedAt || 0) - (a.completedAt || 0),
  );

  return {
    merged,
    addedCount: newGames.length,
    duplicateCount,
  };
}

export function formatGameDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatGameTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Groups game history by opponent matchups
 */
export function groupHistoryByMatchup(history: FinishedGame[]): MatchupSummary[] {
  const matchupMap = new Map<string, MatchupSummary>();

  for (const game of history) {
    const rawNames = game.players.map((p) => p.name.trim());
    // Create a stable sorted key for this group of players
    const sortedKey = [...rawNames].sort((a, b) => a.localeCompare(b)).join(" vs ");

    let summary = matchupMap.get(sortedKey);
    if (!summary) {
      summary = {
        key: sortedKey,
        playerNames: [...rawNames],
        totalGames: 0,
        wins: {},
        ties: 0,
        totalScope: {},
        totalPoints: {},
        categoryWins: {
          carte: {},
          denari: {},
          settebello: {},
          primiera: {},
        },
        games: [],
      };
      for (const name of rawNames) {
        summary.wins[name] = 0;
        summary.totalScope[name] = 0;
        summary.totalPoints[name] = 0;
        summary.categoryWins.carte[name] = 0;
        summary.categoryWins.denari[name] = 0;
        summary.categoryWins.settebello[name] = 0;
        summary.categoryWins.primiera[name] = 0;
      }
      matchupMap.set(sortedKey, summary);
    }

    summary.totalGames += 1;
    summary.games.push(game);

    // Winner & Ties
    const winnerPlayer = game.players.find((p) => p.id === game.winnerId);
    if (winnerPlayer) {
      const winnerName = winnerPlayer.name.trim();
      summary.wins[winnerName] = (summary.wins[winnerName] || 0) + 1;
    } else {
      summary.ties += 1;
    }

    // Points & Scope
    for (const p of game.players) {
      const pName = p.name.trim();
      summary.totalPoints[pName] =
        (summary.totalPoints[pName] || 0) + (game.finalScores[p.id] || 0);
      summary.totalScope[pName] =
        (summary.totalScope[pName] || 0) + (game.totalScope[p.id] || 0);
    }

    // Category wins across rounds
    for (const round of game.rounds) {
      if (round.carteWinnerId) {
        const p = game.players.find((pl) => pl.id === round.carteWinnerId);
        if (p) summary.categoryWins.carte[p.name.trim()] = (summary.categoryWins.carte[p.name.trim()] || 0) + 1;
      }
      if (round.denariWinnerId) {
        const p = game.players.find((pl) => pl.id === round.denariWinnerId);
        if (p) summary.categoryWins.denari[p.name.trim()] = (summary.categoryWins.denari[p.name.trim()] || 0) + 1;
      }
      if (round.settebelloWinnerId) {
        const p = game.players.find((pl) => pl.id === round.settebelloWinnerId);
        if (p) summary.categoryWins.settebello[p.name.trim()] = (summary.categoryWins.settebello[p.name.trim()] || 0) + 1;
      }
      if (round.primieraWinnerId) {
        const p = game.players.find((pl) => pl.id === round.primieraWinnerId);
        if (p) summary.categoryWins.primiera[p.name.trim()] = (summary.categoryWins.primiera[p.name.trim()] || 0) + 1;
      }
    }
  }

  const results = Array.from(matchupMap.values());

  // Sort each matchup's playerNames so the player with the most wins is listed first
  for (const matchup of results) {
    matchup.playerNames.sort((a, b) => {
      const diff = (matchup.wins[b] || 0) - (matchup.wins[a] || 0);
      if (diff !== 0) return diff;
      return a.localeCompare(b);
    });
  }

  // Sort matchups by most games played, then most recent game
  results.sort((a, b) => {
    if (b.totalGames !== a.totalGames) {
      return b.totalGames - a.totalGames;
    }
    const latestA = a.games[0]?.completedAt ?? 0;
    const latestB = b.games[0]?.completedAt ?? 0;
    return latestB - latestA;
  });

  return results;
}
