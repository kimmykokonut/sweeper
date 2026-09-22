import { describe, it, expect } from "vitest";
import {
  primieraValues,
  calculatePrimieraScore,
  determinePrimieraWinner,
} from "./primieraCalculator";
import type { CardSelections } from "../types";

describe("primieraCalculator", () => {
  describe("primieraValues", () => {
    it("should assign correct Scopa Primiera point values to each card", () => {
      expect(primieraValues.seven).toBe(21);
      expect(primieraValues.six).toBe(18);
      expect(primieraValues.ace).toBe(16);
      expect(primieraValues.five).toBe(15);
      expect(primieraValues.four).toBe(14);
      expect(primieraValues.three).toBe(13);
      expect(primieraValues.two).toBe(12);
      expect(primieraValues.jack).toBe(10);
      expect(primieraValues.horse).toBe(10);
      expect(primieraValues.king).toBe(10);
    });
  });

  describe("calculatePrimieraScore", () => {
    it("should return 0 if any suit is missing (hand is incomplete)", () => {
      const missingClubs: CardSelections = {
        coins: "seven",
        cups: "six",
        swords: "ace",
        clubs: null,
      };
      expect(calculatePrimieraScore(missingClubs)).toBe(0);

      const allNull: CardSelections = {
        coins: null,
        cups: null,
        swords: null,
        clubs: null,
      };
      expect(calculatePrimieraScore(allNull)).toBe(0);
    });

    it("should calculate maximum possible Primiera score (four 7s = 84)", () => {
      const perfectHand: CardSelections = {
        coins: "seven",
        cups: "seven",
        swords: "seven",
        clubs: "seven",
      };
      expect(calculatePrimieraScore(perfectHand)).toBe(84);
    });

    it("should calculate minimum possible complete Primiera score (four face cards = 40)", () => {
      const faceHand: CardSelections = {
        coins: "king",
        cups: "horse",
        swords: "jack",
        clubs: "king",
      };
      expect(calculatePrimieraScore(faceHand)).toBe(40);
    });

    it("should accurately sum a standard mixed Primiera hand", () => {
      const mixedHand: CardSelections = {
        coins: "seven", // 21
        cups: "six", // 18
        swords: "ace", // 16
        clubs: "five", // 15
      };
      expect(calculatePrimieraScore(mixedHand)).toBe(21 + 18 + 16 + 15); // 70
    });
  });

  describe("determinePrimieraWinner", () => {
    it("should return null for an empty scores list", () => {
      expect(determinePrimieraWinner([])).toBeNull();
    });

    it("should return player 1 if only one score is provided", () => {
      expect(determinePrimieraWinner([70])).toBe(1);
    });

    it("should return the 1-based index of the player with strictly the highest score", () => {
      expect(determinePrimieraWinner([70, 78])).toBe(2);
      expect(determinePrimieraWinner([84, 70])).toBe(1);
      expect(determinePrimieraWinner([65, 72, 84, 70])).toBe(3);
      expect(determinePrimieraWinner([60, 65, 70, 75])).toBe(4);
    });

    it("should return null if the highest score is tied between top players", () => {
      expect(determinePrimieraWinner([75, 75])).toBeNull();
      expect(determinePrimieraWinner([75, 75, 60])).toBeNull();
      expect(determinePrimieraWinner([80, 80, 80, 70])).toBeNull();
    });

    it("should return the winner even if second place is tied", () => {
      // Player 1 has 80, while Players 2 & 3 are tied at 70
      expect(determinePrimieraWinner([80, 70, 70])).toBe(1);
    });
  });
});
