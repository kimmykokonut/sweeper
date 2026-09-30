import { describe, it, expect } from "vitest";
import {
  CARD_DATA,
  getCardData,
  getCardImage,
  loadSelectedDeck,
  saveSelectedDeck,
} from "./cardData";
import type { CardValue, Suits } from "../types";

describe("cardData (40-card Italian Scopa deck)", () => {
  const suits: Suits[] = ["coins", "cups", "clubs", "swords"];
  const expectedValues: CardValue[] = [
    "seven",
    "six",
    "ace",
    "five",
    "four",
    "three",
    "two",
    "jack",
    "horse",
    "king",
  ];

  const expectedPoints: Record<CardValue, number> = {
    seven: 21,
    six: 18,
    ace: 16,
    five: 15,
    four: 14,
    three: 13,
    two: 12,
    jack: 10,
    horse: 10,
    king: 10,
  };

  it("should contain exactly 4 suits with accurate Italian and English names", () => {
    expect(Object.keys(CARD_DATA).sort()).toEqual(suits.slice().sort());

    expect(CARD_DATA.coins.name).toBe("Coins");
    expect(CARD_DATA.coins.displayName).toBe("Denari");
    expect(CARD_DATA.coins.icon).toBeTruthy();

    expect(CARD_DATA.cups.name).toBe("Cups");
    expect(CARD_DATA.cups.displayName).toBe("Coppe");
    expect(CARD_DATA.cups.icon).toBeTruthy();

    expect(CARD_DATA.clubs.name).toBe("Clubs");
    expect(CARD_DATA.clubs.displayName).toBe("Bastoni");
    expect(CARD_DATA.clubs.icon).toBeTruthy();

    expect(CARD_DATA.swords.name).toBe("Swords");
    expect(CARD_DATA.swords.displayName).toBe("Spade");
    expect(CARD_DATA.swords.icon).toBeTruthy();
  });

  it("should have exactly 10 cards per suit (40 cards total)", () => {
    let totalCards = 0;
    for (const suit of suits) {
      expect(CARD_DATA[suit].cards).toHaveLength(10);
      totalCards += CARD_DATA[suit].cards.length;
    }
    expect(totalCards).toBe(40);
  });

  it("should have correct Primiera point values for all cards", () => {
    for (const suit of suits) {
      const cards = CARD_DATA[suit].cards;
      const valuesInSuit = cards.map((c) => c.value);

      expect(valuesInSuit.sort()).toEqual(expectedValues.slice().sort());

      for (const card of cards) {
        expect(card.points).toBe(expectedPoints[card.value]);
        expect(typeof card.image).toBe("string");
        expect(card.image.length).toBeGreaterThan(0);
        expect(card.displayName).toBeTruthy();
      }
    }
  });

  it("getCardImage should return the asset path for a valid suit and value", () => {
    for (const suit of suits) {
      for (const value of expectedValues) {
        const image = getCardImage(suit, value);
        expect(image).toBeTruthy();
        expect(typeof image).toBe("string");
      }
    }
  });

  it("getCardImage should return undefined if card value is not found", () => {
    // @ts-expect-error Testing non-existent card value
    const result = getCardImage("coins", "joker");
    expect(result).toBeUndefined();
  });

  describe("Multi-deck support (Piacentine & Napoletane)", () => {
    it("getCardData should support both Napoletane and Piacentine with 40 cards each", () => {
      const nap = getCardData("napoletane");
      const piac = getCardData("piacentine");

      for (const suit of suits) {
        expect(nap[suit].cards).toHaveLength(10);
        expect(piac[suit].cards).toHaveLength(10);

        for (let i = 0; i < 10; i++) {
          expect(nap[suit].cards[i].value).toBe(piac[suit].cards[i].value);
          expect(nap[suit].cards[i].points).toBe(piac[suit].cards[i].points);
          // Images should be distinct between decks
          expect(nap[suit].cards[i].image).not.toBe(piac[suit].cards[i].image);
        }
      }
    });

    it("getCardImage should return distinct images for the same card across decks", () => {
      const napSettebello = getCardImage("coins", "seven", "napoletane");
      const piacSettebello = getCardImage("coins", "seven", "piacentine");

      expect(napSettebello).toBeTruthy();
      expect(piacSettebello).toBeTruthy();
      expect(napSettebello).not.toBe(piacSettebello);
    });

    it("loadSelectedDeck should default to napoletane when storage is empty or invalid", () => {
      localStorage.clear();
      expect(loadSelectedDeck()).toBe("napoletane");

      localStorage.setItem("sweeper_selected_deck", "invalid_deck");
      expect(loadSelectedDeck()).toBe("napoletane");
    });

    it("saveSelectedDeck and loadSelectedDeck should persist deck preference", () => {
      saveSelectedDeck("piacentine");
      expect(loadSelectedDeck()).toBe("piacentine");

      saveSelectedDeck("napoletane");
      expect(loadSelectedDeck()).toBe("napoletane");
    });
  });
});
