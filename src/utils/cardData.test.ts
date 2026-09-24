import { describe, it, expect } from "vitest";
import { CARD_DATA, getCardImage } from "./cardData";
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
});
