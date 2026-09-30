import { useState, useEffect } from "react";
import type { CardValue, DeckStyle, Suits } from "../types";

// Suit icons (shared across card table)
import coin from "../assets/denare.png";
import cup from "../assets/coppa.png";
import club from "../assets/bastone.png";
import sword from "../assets/spada.png";

export interface DeckOption {
  id: DeckStyle;
  label: string;
  sublabel?: string;
}

export const DECK_OPTIONS: DeckOption[] = [
  { id: "napoletane", label: "Napoletane", sublabel: "(Default)" },
  { id: "piacentine", label: "Piacentine" },
  { id: "siciliane", label: "Siciliane" },
  { id: "bergamasche", label: "Bergamasche" },
  { id: "sarde", label: "Sarde" },
  { id: "romagnole", label: "Romagnole" },
  { id: "bresciane", label: "Bresciane" },
];

const VALID_DECKS: Set<string> = new Set(DECK_OPTIONS.map((d) => d.id));

export const DECK_STORAGE_KEY = "sweeper_selected_deck";

export function loadSelectedDeck(): DeckStyle {
  try {
    const saved = localStorage.getItem(DECK_STORAGE_KEY);
    if (saved && VALID_DECKS.has(saved)) {
      return saved as DeckStyle;
    }
  } catch (e) {
    console.error("Failed to load deck preference", e);
  }
  return "napoletane";
}

export function saveSelectedDeck(deck: DeckStyle): void {
  try {
    localStorage.setItem(DECK_STORAGE_KEY, deck);
  } catch (e) {
    console.error("Failed to save deck preference", e);
  }
}

export function useDeckStyle(): [DeckStyle, (deck: DeckStyle) => void] {
  const [deck, setDeck] = useState<DeckStyle>(() => loadSelectedDeck());

  useEffect(() => {
    const handleDeckChange = () => setDeck(loadSelectedDeck());
    window.addEventListener("sweeper-deck-change", handleDeckChange);
    window.addEventListener("storage", handleDeckChange);
    return () => {
      window.removeEventListener("sweeper-deck-change", handleDeckChange);
      window.removeEventListener("storage", handleDeckChange);
    };
  }, []);

  const updateDeck = (newDeck: DeckStyle) => {
    saveSelectedDeck(newDeck);
    setDeck(newDeck);
    window.dispatchEvent(new Event("sweeper-deck-change"));
  };

  return [deck, updateDeck];
}

const SUIT_NAME_MAP: Record<string, Suits> = {
  denari: "coins",
  coppe: "cups",
  bastoni: "clubs",
  spade: "swords",
};

const NUM_TO_CARD_VALUE: Record<number, CardValue> = {
  7: "seven",
  6: "six",
  1: "ace",
  5: "five",
  4: "four",
  3: "three",
  2: "two",
  8: "jack",
  9: "horse",
  10: "king",
};

// Dynamically glob all card images across all deck directories in src/assets/decks/
const deckAssetModules = import.meta.glob<string>(
  "../assets/decks/*/*.{jpg,webp,svg}",
  { eager: true, import: "default" }
);

function initDeckImages(): Record<DeckStyle, Record<Suits, Record<CardValue, string>>> {
  const images = {} as Record<DeckStyle, Record<Suits, Record<CardValue, string>>>;
  for (const opt of DECK_OPTIONS) {
    images[opt.id] = {
      coins: {} as Record<CardValue, string>,
      cups: {} as Record<CardValue, string>,
      clubs: {} as Record<CardValue, string>,
      swords: {} as Record<CardValue, string>,
    };
  }

  for (const [filepath, imageSrc] of Object.entries(deckAssetModules)) {
    const match = filepath.match(/\/decks\/([^/]+)\/([a-z]+)-(\d+)\.[a-z]+$/);
    if (!match) continue;

    const [, deckName, suitName, numStr] = match;
    const suit = SUIT_NAME_MAP[suitName];
    const cardVal = NUM_TO_CARD_VALUE[parseInt(numStr, 10)];

    if (suit && cardVal && deckName in images) {
      images[deckName as DeckStyle][suit][cardVal] = imageSrc;
    }
  }

  return images;
}

const DECK_IMAGES = initDeckImages();

export const CARD_DEFINITIONS: Record<
  Suits,
  Array<{ value: CardValue; displayName: string; points: number }>
> = {
  coins: [
    { value: "seven", displayName: "7", points: 21 },
    { value: "six", displayName: "6", points: 18 },
    { value: "ace", displayName: "A", points: 16 },
    { value: "five", displayName: "5", points: 15 },
    { value: "four", displayName: "4", points: 14 },
    { value: "three", displayName: "3", points: 13 },
    { value: "two", displayName: "2", points: 12 },
    { value: "jack", displayName: "Jack", points: 10 },
    { value: "horse", displayName: "Horse", points: 10 },
    { value: "king", displayName: "King", points: 10 },
  ],
  cups: [
    { value: "seven", displayName: "7", points: 21 },
    { value: "six", displayName: "6", points: 18 },
    { value: "ace", displayName: "A", points: 16 },
    { value: "five", displayName: "5", points: 15 },
    { value: "four", displayName: "4", points: 14 },
    { value: "three", displayName: "3", points: 13 },
    { value: "two", displayName: "2", points: 12 },
    { value: "jack", displayName: "Jack", points: 10 },
    { value: "horse", displayName: "Horse", points: 10 },
    { value: "king", displayName: "King", points: 10 },
  ],
  clubs: [
    { value: "seven", displayName: "7", points: 21 },
    { value: "six", displayName: "6", points: 18 },
    { value: "ace", displayName: "A", points: 16 },
    { value: "five", displayName: "5", points: 15 },
    { value: "four", displayName: "4", points: 14 },
    { value: "three", displayName: "3", points: 13 },
    { value: "two", displayName: "2", points: 12 },
    { value: "jack", displayName: "Jack", points: 10 },
    { value: "horse", displayName: "Horse", points: 10 },
    { value: "king", displayName: "King", points: 10 },
  ],
  swords: [
    { value: "seven", displayName: "7", points: 21 },
    { value: "six", displayName: "6", points: 18 },
    { value: "ace", displayName: "A", points: 16 },
    { value: "five", displayName: "5", points: 15 },
    { value: "four", displayName: "4", points: 14 },
    { value: "three", displayName: "3", points: 13 },
    { value: "two", displayName: "2", points: 12 },
    { value: "jack", displayName: "Jack", points: 10 },
    { value: "horse", displayName: "Horse", points: 10 },
    { value: "king", displayName: "King", points: 10 },
  ],
};

export function getCardData(deckStyle: DeckStyle = loadSelectedDeck()): Record<
  Suits,
  {
    name: string;
    displayName: string;
    icon: string;
    cards: Array<{
      value: CardValue;
      image: string;
      displayName: string;
      points: number;
    }>;
  }
> {
  return {
    coins: {
      name: "Coins",
      displayName: "Denari",
      icon: coin,
      cards: CARD_DEFINITIONS.coins.map((def) => ({
        ...def,
        image: DECK_IMAGES[deckStyle].coins[def.value],
      })),
    },
    cups: {
      name: "Cups",
      displayName: "Coppe",
      icon: cup,
      cards: CARD_DEFINITIONS.cups.map((def) => ({
        ...def,
        image: DECK_IMAGES[deckStyle].cups[def.value],
      })),
    },
    clubs: {
      name: "Clubs",
      displayName: "Bastoni",
      icon: club,
      cards: CARD_DEFINITIONS.clubs.map((def) => ({
        ...def,
        image: DECK_IMAGES[deckStyle].clubs[def.value],
      })),
    },
    swords: {
      name: "Swords",
      displayName: "Spade",
      icon: sword,
      cards: CARD_DEFINITIONS.swords.map((def) => ({
        ...def,
        image: DECK_IMAGES[deckStyle].swords[def.value],
      })),
    },
  };
}

export const CARD_DATA = getCardData("napoletane");

export const getCardImage = (
  suit: Suits,
  value: CardValue,
  deckStyle: DeckStyle = loadSelectedDeck(),
): string | undefined => {
  return DECK_IMAGES[deckStyle]?.[suit]?.[value];
};
