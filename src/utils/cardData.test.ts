import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  CARD_DATA,
  getCardData,
  getCardImage,
  loadSelectedDeck,
  saveSelectedDeck,
} from "./cardData";
import type { CardValue, Suits } from "../types";

describe("cardData (40-card Italian Scopa deck)", () => {
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
        expect(card.shortName).toBeTruthy();
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

  describe("Multi-deck support (Napoletane, Piacentine, Siciliane, Bergamasche, Sarde, Romagnole & Bresciane)", () => {
    it("getCardData should support all seven decks with 40 cards each", () => {
      const nap = getCardData("napoletane");
      const piac = getCardData("piacentine");
      const sic = getCardData("siciliane");
      const berg = getCardData("bergamasche");
      const sarde = getCardData("sarde");
      const rom = getCardData("romagnole");
      const bres = getCardData("bresciane");

      for (const suit of suits) {
        expect(nap[suit].cards).toHaveLength(10);
        expect(piac[suit].cards).toHaveLength(10);
        expect(sic[suit].cards).toHaveLength(10);
        expect(berg[suit].cards).toHaveLength(10);
        expect(sarde[suit].cards).toHaveLength(10);
        expect(rom[suit].cards).toHaveLength(10);
        expect(bres[suit].cards).toHaveLength(10);

        for (let i = 0; i < 10; i++) {
          expect(nap[suit].cards[i].value).toBe(piac[suit].cards[i].value);
          expect(piac[suit].cards[i].value).toBe(sic[suit].cards[i].value);
          expect(sic[suit].cards[i].value).toBe(berg[suit].cards[i].value);
          expect(berg[suit].cards[i].value).toBe(sarde[suit].cards[i].value);
          expect(sarde[suit].cards[i].value).toBe(rom[suit].cards[i].value);
          expect(rom[suit].cards[i].value).toBe(bres[suit].cards[i].value);
          expect(nap[suit].cards[i].points).toBe(bres[suit].cards[i].points);

          // Images should be distinct across all seven decks
          const imgNap = nap[suit].cards[i].image;
          const imgPiac = piac[suit].cards[i].image;
          const imgSic = sic[suit].cards[i].image;
          const imgBerg = berg[suit].cards[i].image;
          const imgSarde = sarde[suit].cards[i].image;
          const imgRom = rom[suit].cards[i].image;
          const imgBres = bres[suit].cards[i].image;

          expect(imgNap).not.toBe(imgPiac);
          expect(imgPiac).not.toBe(imgSic);
          expect(imgSic).not.toBe(imgBerg);
          expect(imgBerg).not.toBe(imgSarde);
          expect(imgSarde).not.toBe(imgRom);
          expect(imgRom).not.toBe(imgBres);
          expect(imgNap).not.toBe(imgBres);
        }
      }
    });

    it("getCardImage should return distinct images for the same card across decks", () => {
      const napSettebello = getCardImage("coins", "seven", "napoletane");
      const piacSettebello = getCardImage("coins", "seven", "piacentine");
      const sicSettebello = getCardImage("coins", "seven", "siciliane");
      const bergSettebello = getCardImage("coins", "seven", "bergamasche");
      const sardeSettebello = getCardImage("coins", "seven", "sarde");
      const romSettebello = getCardImage("coins", "seven", "romagnole");
      const bresSettebello = getCardImage("coins", "seven", "bresciane");

      expect(napSettebello).toBeTruthy();
      expect(piacSettebello).toBeTruthy();
      expect(sicSettebello).toBeTruthy();
      expect(bergSettebello).toBeTruthy();
      expect(sardeSettebello).toBeTruthy();
      expect(romSettebello).toBeTruthy();
      expect(bresSettebello).toBeTruthy();

      expect(napSettebello).not.toBe(piacSettebello);
      expect(piacSettebello).not.toBe(sicSettebello);
      expect(sicSettebello).not.toBe(bergSettebello);
      expect(bergSettebello).not.toBe(sardeSettebello);
      expect(sardeSettebello).not.toBe(romSettebello);
      expect(romSettebello).not.toBe(bresSettebello);
      expect(napSettebello).not.toBe(bresSettebello);
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

      saveSelectedDeck("siciliane");
      expect(loadSelectedDeck()).toBe("siciliane");

      saveSelectedDeck("bergamasche");
      expect(loadSelectedDeck()).toBe("bergamasche");

      saveSelectedDeck("sarde");
      expect(loadSelectedDeck()).toBe("sarde");

      saveSelectedDeck("romagnole");
      expect(loadSelectedDeck()).toBe("romagnole");

      saveSelectedDeck("bresciane");
      expect(loadSelectedDeck()).toBe("bresciane");

      saveSelectedDeck("napoletane");
      expect(loadSelectedDeck()).toBe("napoletane");
    });
  });
});
