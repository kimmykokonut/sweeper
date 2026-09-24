import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  calculateRoundTotals,
  recalculateGame,
  determineWinnerFromCounts,
  calculateAutoFillCards,
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

    it("should return null if stored game state is corrupted JSON", () => {
      mockStorage["sweeper_active_game"] = "not-valid-json{{{";
      expect(loadGameState()).toBeNull();
    });

    it("should return null if stored game state is missing players or rounds", () => {
      mockStorage["sweeper_active_game"] = JSON.stringify({
        id: "game_broken",
        players: [],
      });
      expect(loadGameState()).toBeNull();

      mockStorage["sweeper_active_game"] = JSON.stringify({
        id: "game_broken_rounds",
        players: [{ id: "p1", name: "Player 1" }],
        // missing rounds array
      });
      expect(loadGameState()).toBeNull();
    });
  });

  describe("calculateAutoFillCards", () => {
    const twoPlayerIds = ["p1", "p2"];

    it("should auto-fill the other player and determine winner in a 2-player game", () => {
      const result = calculateAutoFillCards({}, "p1", "24", twoPlayerIds, null);
      expect(result.updatedCounts).toEqual({ p1: 24, p2: 16 });
      expect(result.autoFilledId).toBe("p2");
      expect(result.carteWinnerId).toBe("p1");
    });

    it("should clamp card count to 40 maximum in a 2-player game", () => {
      const result = calculateAutoFillCards({}, "p1", "45", twoPlayerIds, null);
      expect(result.updatedCounts).toEqual({ p1: 40, p2: 0 });
      expect(result.autoFilledId).toBe("p2");
      expect(result.carteWinnerId).toBe("p1");
    });

    it("should declare tie when cards are split 20-20 in a 2-player game", () => {
      const result = calculateAutoFillCards({}, "p1", "20", twoPlayerIds, null);
      expect(result.updatedCounts).toEqual({ p1: 20, p2: 20 });
      expect(result.carteWinnerId).toBe("tie");
    });

    it("should clear both players when deleting input (empty string) in a 2-player game", () => {
      const initial = { p1: 22, p2: 18 };
      const result = calculateAutoFillCards(initial, "p1", "", twoPlayerIds, "p2");
      expect(result.updatedCounts).toEqual({ p1: undefined, p2: undefined });
      expect(result.autoFilledId).toBeNull();
      expect(result.carteWinnerId).toBeNull();
    });

    it("should handle 3-player game: clamp entry and auto-fill last player once 2 players enter counts", () => {
      const threePlayerIds = ["p1", "p2", "p3"];

      // Step 1: p1 enters 15
      const step1 = calculateAutoFillCards({}, "p1", "15", threePlayerIds, null);
      expect(step1.updatedCounts.p1).toBe(15);
      expect(step1.autoFilledId).toBeNull(); // Only 1 of 3 filled, no auto-fill yet
      expect(step1.carteWinnerId).toBe("p1");

      // Step 2: p2 enters 15 -> exactly (3 - 1) = 2 players filled, p3 auto-fills remainder (40 - 30 = 10)
      const step2 = calculateAutoFillCards(
        step1.updatedCounts,
        "p2",
        "15",
        threePlayerIds,
        step1.autoFilledId,
      );
      expect(step2.updatedCounts).toEqual({ p1: 15, p2: 15, p3: 10 });
      expect(step2.autoFilledId).toBe("p3");
      expect(step2.carteWinnerId).toBe("tie"); // p1 and p2 tied at 15
    });

    it("should clear stale auto-filled player when a count is cleared in 3-player game", () => {
      const threePlayerIds = ["p1", "p2", "p3"];
      const counts = { p1: 15, p2: 15, p3: 10 };

      const result = calculateAutoFillCards(counts, "p1", "", threePlayerIds, "p3");
      expect(result.updatedCounts.p1).toBeUndefined();
      expect(result.updatedCounts.p3).toBeUndefined(); // Stale auto-fill cleared
      expect(result.updatedCounts.p2).toBe(15); // p2 remains
      expect(result.autoFilledId).toBeNull();
      expect(result.carteWinnerId).toBe("p2");
    });

    it("should ignore non-numeric string values safely", () => {
      const result = calculateAutoFillCards({ p1: 20 }, "p1", "abc", twoPlayerIds, null);
      expect(result.updatedCounts).toEqual({ p1: 20 });
    });
  });

  describe("4-player team mode scoring", () => {
    const teams: Player[] = [
      { id: "p1", name: "Team 1" },
      { id: "p2", name: "Team 2" },
    ];

    it("should calculate game and declare winning team correctly", () => {
      const rounds = [
        {
          roundNumber: 1,
          scope: { p1: 3, p2: 1 },
          carteWinnerId: "p1",
          denariWinnerId: "p1",
          settebelloWinnerId: "p1",
          primieraWinnerId: "p2",
        },
        {
          roundNumber: 2,
          scope: { p1: 4, p2: 0 },
          carteWinnerId: "p1",
          denariWinnerId: "p1",
          settebelloWinnerId: "p1",
          primieraWinnerId: "p1",
        },
      ];

      const result = recalculateGame(rounds, teams, 11);
      // Round 1: Team 1 has 3 (scope) + 3 categories = 6 pts; Team 2 has 1 (scope) + 1 category = 2 pts
      expect(result.recalculatedRounds[0].cumulativeTotals).toEqual({ p1: 6, p2: 2 });
      // Round 2: Team 1 has 4 + 4 categories = 8 pts -> Total 14 pts; Team 2 has 2 pts
      expect(result.recalculatedRounds[1].cumulativeTotals).toEqual({ p1: 14, p2: 2 });
      expect(result.isFinished).toBe(true);
      expect(result.winnerId).toBe("p1");
    });
  });
});
