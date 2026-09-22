import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  calculateRoundTotals,
  recalculateGame,
  determineWinnerFromCounts,
  saveGameState,
  loadGameState,
  clearGameState,
} from "./scorecardHelpers";
import type { GameState, Player, RoundEntry } from "../types";

describe("scorecardHelpers", () => {
  const players: Player[] = [
    { id: "p1", name: "Player 1" },
    { id: "p2", name: "Player 2" },
  ];

  describe("calculateRoundTotals", () => {
    it("should calculate correct round points including sweeps and category points", () => {
      const rawRound: Omit<RoundEntry, "roundTotals" | "cumulativeTotals"> = {
        roundNumber: 1,
        scope: { p1: 2, p2: 0 }, // p1 has 2 sweeps
        carteWinnerId: "p1", // p1 gets carte (+1)
        denariWinnerId: "p2", // p2 gets denari (+1)
        settebelloWinnerId: "p1", // p1 gets settebello (+1)
        primieraWinnerId: "p2", // p2 gets primiera (+1)
      };

      const totals = calculateRoundTotals(rawRound, players);
      // p1: 2 (scope) + 1 (carte) + 1 (settebello) = 4
      // p2: 0 (scope) + 1 (denari) + 1 (primiera) = 2
      expect(totals.p1).toBe(4);
      expect(totals.p2).toBe(2);
    });

    it("should award 0 category points when a category ends in a tie", () => {
      const rawRound: Omit<RoundEntry, "roundTotals" | "cumulativeTotals"> = {
        roundNumber: 1,
        scope: { p1: 0, p2: 0 },
        carteWinnerId: null, // tie (e.g. 20-20) -> 0 pts
        denariWinnerId: null, // tie (e.g. 5-5) -> 0 pts
        settebelloWinnerId: "p2", // p2 gets settebello (+1)
        primieraWinnerId: null, // tie -> 0 pts
      };

      const totals = calculateRoundTotals(rawRound, players);
      expect(totals.p1).toBe(0);
      expect(totals.p2).toBe(1);
    });
  });

  describe("recalculateGame", () => {
    it("should return empty rounds and unfinished game when rounds list is empty", () => {
      const result = recalculateGame([], players, 11);
      expect(result.recalculatedRounds).toEqual([]);
      expect(result.isFinished).toBe(false);
      expect(result.winnerId).toBeNull();
    });

    it("should accumulate cumulative totals across sequential rounds", () => {
      const rounds = [
        {
          roundNumber: 1,
          scope: { p1: 1, p2: 0 },
          carteWinnerId: "p1",
          denariWinnerId: "p1",
          settebelloWinnerId: "p1",
          primieraWinnerId: "p2",
        },
        {
          roundNumber: 2,
          scope: { p1: 0, p2: 1 },
          carteWinnerId: "p2",
          denariWinnerId: "p2",
          settebelloWinnerId: "p2",
          primieraWinnerId: "p1",
        },
      ];

      const result = recalculateGame(rounds, players, 11);

      // Round 1 totals: p1 = 1 + 1 + 1 + 1 = 4, p2 = 1
      expect(result.recalculatedRounds[0].roundTotals).toEqual({ p1: 4, p2: 1 });
      expect(result.recalculatedRounds[0].cumulativeTotals).toEqual({ p1: 4, p2: 1 });

      // Round 2 totals: p1 = 1, p2 = 1 + 1 + 1 + 1 = 4
      expect(result.recalculatedRounds[1].roundTotals).toEqual({ p1: 1, p2: 4 });
      expect(result.recalculatedRounds[1].cumulativeTotals).toEqual({ p1: 5, p2: 5 });

      expect(result.isFinished).toBe(false);
      expect(result.winnerId).toBeNull();
    });

    it("should declare a winner when a player reaches or exceeds target score with a lead", () => {
      const rounds = [
        {
          roundNumber: 1,
          scope: { p1: 8, p2: 0 },
          carteWinnerId: "p1",
          denariWinnerId: "p1",
          settebelloWinnerId: "p1",
          primieraWinnerId: "p2",
        },
      ];

      // Round 1: p1 has 8 (scope) + 3 categories = 11 pts. p2 has 1 pt.
      const result = recalculateGame(rounds, players, 11);
      expect(result.recalculatedRounds[0].cumulativeTotals.p1).toBe(11);
      expect(result.isFinished).toBe(true);
      expect(result.winnerId).toBe("p1");
    });

    it("should NOT finish the game if players are tied at or above target score", () => {
      // Both players reach 11 points in the same round
      const rounds = [
        {
          roundNumber: 1,
          scope: { p1: 10, p2: 10 },
          carteWinnerId: "p1",
          denariWinnerId: "p2",
          settebelloWinnerId: null,
          primieraWinnerId: null,
        },
      ];

      // p1 has 11 pts, p2 has 11 pts. Target score is 11.
      const result = recalculateGame(rounds, players, 11);
      expect(result.recalculatedRounds[0].cumulativeTotals.p1).toBe(11);
      expect(result.recalculatedRounds[0].cumulativeTotals.p2).toBe(11);
      expect(result.isFinished).toBe(false);
      expect(result.winnerId).toBeNull();
    });

    it("should finish the game in a subsequent round once a tied lead is broken", () => {
      const rounds = [
        // Round 1: Tied at 11-11
        {
          roundNumber: 1,
          scope: { p1: 10, p2: 10 },
          carteWinnerId: "p1",
          denariWinnerId: "p2",
          settebelloWinnerId: null,
          primieraWinnerId: null,
        },
        // Round 2: p2 scores 2 pts, p1 scores 0 pts
        {
          roundNumber: 2,
          scope: { p1: 0, p2: 0 },
          carteWinnerId: "p2",
          denariWinnerId: "p2",
          settebelloWinnerId: null,
          primieraWinnerId: null,
        },
      ];

      const result = recalculateGame(rounds, players, 11);
      expect(result.recalculatedRounds[1].cumulativeTotals).toEqual({ p1: 11, p2: 13 });
      expect(result.isFinished).toBe(true);
      expect(result.winnerId).toBe("p2");
    });
  });

  describe("determineWinnerFromCounts", () => {
    it("should identify the player with strictly the highest count", () => {
      expect(determineWinnerFromCounts({ p1: 22, p2: 18 })).toBe("p1");
      expect(determineWinnerFromCounts({ p1: 17, p2: 23 })).toBe("p2");
    });

    it("should return null on equal count (tie)", () => {
      expect(determineWinnerFromCounts({ p1: 20, p2: 20 })).toBeNull();
      expect(determineWinnerFromCounts({ p1: 5, p2: 5 })).toBeNull();
    });

    it("should handle 3+ players correctly", () => {
      expect(determineWinnerFromCounts({ p1: 12, p2: 15, p3: 13 })).toBe("p2");
      expect(determineWinnerFromCounts({ p1: 15, p2: 15, p3: 10 })).toBeNull(); // top tied
      expect(determineWinnerFromCounts({ p1: 18, p2: 11, p3: 11 })).toBe("p1"); // second place tied
    });

    it("should ignore NaN and 0 values", () => {
      expect(determineWinnerFromCounts({ p1: 15, p2: 0 })).toBe("p1");
      expect(determineWinnerFromCounts({})).toBeNull();
    });
  });

  describe("localStorage game state helpers", () => {
    let mockStorage: Record<string, string> = {};

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

    it("should save and load game state faithfully", () => {
      const sampleGame: GameState = {
        id: "game_test_123",
        createdAt: 1700000000,
        players,
        settings: { playerCount: 2, targetScore: 11 },
        rounds: [],
        isFinished: false,
        winnerId: null,
      };

      saveGameState(sampleGame);
      const loaded = loadGameState();
      expect(loaded).toEqual(sampleGame);
    });

    it("should return null if no game state is stored", () => {
      expect(loadGameState()).toBeNull();
    });

    it("should clear game state from storage", () => {
      const sampleGame: GameState = {
        id: "game_test_123",
        createdAt: 1700000000,
        players,
        settings: { playerCount: 2, targetScore: 11 },
        rounds: [],
        isFinished: false,
        winnerId: null,
      };

      saveGameState(sampleGame);
      expect(loadGameState()).not.toBeNull();

      clearGameState();
      expect(loadGameState()).toBeNull();
    });
  });
});
