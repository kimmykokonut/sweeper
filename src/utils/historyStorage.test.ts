import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveFinishedGame,
  loadGameHistory,
  deleteGameFromHistory,
  clearGameHistory,
  HISTORY_STORAGE_KEY,
} from "./scorecardHelpers";
import type { GameState, Player } from "../types";

describe("historyStorage (sweeper_game_history)", () => {
  let mockStorage: Record<string, string> = {};

  const players: Player[] = [
    { id: "p1", name: "Player 1" },
    { id: "p2", name: "Player 2" },
  ];

  beforeEach(() => {
    mockStorage = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    });
  });

  const createSampleFinishedGame = (id: string, winnerId: string = "p1"): GameState => ({
    id,
    createdAt: 1700000000,
    players,
    settings: { playerCount: 2, targetScore: 11 },
    isFinished: true,
    winnerId,
    rounds: [
      {
        roundNumber: 1,
        scope: { p1: 2, p2: 1 },
        carteWinnerId: "p1",
        denariWinnerId: "p1",
        settebelloWinnerId: "p1",
        primieraWinnerId: "p2",
        roundTotals: { p1: 5, p2: 2 },
        cumulativeTotals: { p1: 5, p2: 2 },
      },
      {
        roundNumber: 2,
        scope: { p1: 3, p2: 0 },
        carteWinnerId: "p1",
        denariWinnerId: "p1",
        settebelloWinnerId: "p1",
        primieraWinnerId: "p1",
        roundTotals: { p1: 7, p2: 0 },
        cumulativeTotals: { p1: 12, p2: 2 },
      },
    ],
  });

  it("should return empty array when no game history is stored", () => {
    expect(loadGameHistory()).toEqual([]);
  });

  it("should save a finished game and compute finalScores and totalScope correctly", () => {
    const game = createSampleFinishedGame("game_1");
    const saved = saveFinishedGame(game);

    expect(saved).not.toBeNull();
    expect(saved?.id).toBe("game_1");
    expect(saved?.winnerId).toBe("p1");
    // Final cumulative scores from last round: p1: 12, p2: 2
    expect(saved?.finalScores).toEqual({ p1: 12, p2: 2 });
    // Total scope summed across rounds: p1: 2 + 3 = 5, p2: 1 + 0 = 1
    expect(saved?.totalScope).toEqual({ p1: 5, p2: 1 });

    const history = loadGameHistory();
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(saved);
  });

  it("should not save an unfinished game and return null", () => {
    const unfinishedGame: GameState = {
      ...createSampleFinishedGame("game_unf"),
      isFinished: false,
      winnerId: null,
    };

    const saved = saveFinishedGame(unfinishedGame);
    expect(saved).toBeNull();
    expect(loadGameHistory()).toEqual([]);
  });

  it("should prepend newly finished games so newest appears first", () => {
    const game1 = createSampleFinishedGame("game_1");
    const game2 = createSampleFinishedGame("game_2");

    saveFinishedGame(game1);
    saveFinishedGame(game2);

    const history = loadGameHistory();
    expect(history).toHaveLength(2);
    expect(history[0].id).toBe("game_2");
    expect(history[1].id).toBe("game_1");
  });

  it("should deduplicate and update existing finished games in place by id", () => {
    const originalGame = createSampleFinishedGame("game_dup");
    saveFinishedGame(originalGame);

    const historyBefore = loadGameHistory();
    const originalCompletedAt = historyBefore[0].completedAt;

    // Simulate editing round 2 after completion (e.g. p1 got 2 sweeps instead of 3)
    const updatedGame: GameState = {
      ...originalGame,
      rounds: [
        originalGame.rounds[0],
        {
          ...originalGame.rounds[1],
          scope: { p1: 2, p2: 0 },
          roundTotals: { p1: 6, p2: 0 },
          cumulativeTotals: { p1: 11, p2: 2 },
        },
      ],
    };

    saveFinishedGame(updatedGame);

    const historyAfter = loadGameHistory();
    expect(historyAfter).toHaveLength(1);
    expect(historyAfter[0].id).toBe("game_dup");
    // Final score reflects the update
    expect(historyAfter[0].finalScores).toEqual({ p1: 11, p2: 2 });
    // Total scope reflects the update (2 + 2 = 4)
    expect(historyAfter[0].totalScope).toEqual({ p1: 4, p2: 1 });
    // Preserves original completedAt
    expect(historyAfter[0].completedAt).toBe(originalCompletedAt);
  });

  it("should handle corrupted JSON in localStorage gracefully", () => {
    mockStorage[HISTORY_STORAGE_KEY] = "not-valid-json{{{";
    expect(loadGameHistory()).toEqual([]);

    mockStorage[HISTORY_STORAGE_KEY] = JSON.stringify({ not: "an array" });
    expect(loadGameHistory()).toEqual([]);
  });

  it("should delete an individual game by id from history", () => {
    const game1 = createSampleFinishedGame("game_1");
    const game2 = createSampleFinishedGame("game_2");

    saveFinishedGame(game1);
    saveFinishedGame(game2);
    expect(loadGameHistory()).toHaveLength(2);

    deleteGameFromHistory("game_1");
    const history = loadGameHistory();
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe("game_2");
  });

  it("should clear entire game history", () => {
    saveFinishedGame(createSampleFinishedGame("game_1"));
    saveFinishedGame(createSampleFinishedGame("game_2"));
    expect(loadGameHistory()).toHaveLength(2);

    clearGameHistory();
    expect(loadGameHistory()).toEqual([]);
    expect(mockStorage[HISTORY_STORAGE_KEY]).toBeUndefined();
  });
});
