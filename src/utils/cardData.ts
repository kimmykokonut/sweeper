import { useState, useEffect } from "react";
import type { CardValue, DeckStyle, Suits } from "../types";

// Napoletane Deck Images
import napSevenCoins from "../assets/decks/napoletane/denari-7.jpg";
import napSixCoins from "../assets/decks/napoletane/denari-6.jpg";
import napAceCoins from "../assets/decks/napoletane/denari-1.jpg";
import napFiveCoins from "../assets/decks/napoletane/denari-5.jpg";
import napFourCoins from "../assets/decks/napoletane/denari-4.jpg";
import napThreeCoins from "../assets/decks/napoletane/denari-3.jpg";
import napTwoCoins from "../assets/decks/napoletane/denari-2.jpg";
import napEightCoins from "../assets/decks/napoletane/denari-8.jpg";
import napNineCoins from "../assets/decks/napoletane/denari-9.jpg";
import napTenCoins from "../assets/decks/napoletane/denari-10.jpg";

import napSevenCups from "../assets/decks/napoletane/coppe-7.jpg";
import napSixCups from "../assets/decks/napoletane/coppe-6.jpg";
import napAceCups from "../assets/decks/napoletane/coppe-1.jpg";
import napFiveCups from "../assets/decks/napoletane/coppe-5.jpg";
import napFourCups from "../assets/decks/napoletane/coppe-4.jpg";
import napThreeCups from "../assets/decks/napoletane/coppe-3.jpg";
import napTwoCups from "../assets/decks/napoletane/coppe-2.jpg";
import napEightCups from "../assets/decks/napoletane/coppe-8.jpg";
import napNineCups from "../assets/decks/napoletane/coppe-9.jpg";
import napTenCups from "../assets/decks/napoletane/coppe-10.jpg";

import napSevenClubs from "../assets/decks/napoletane/bastoni-7.jpg";
import napSixClubs from "../assets/decks/napoletane/bastoni-6.jpg";
import napAceClubs from "../assets/decks/napoletane/bastoni-1.jpg";
import napFiveClubs from "../assets/decks/napoletane/bastoni-5.jpg";
import napFourClubs from "../assets/decks/napoletane/bastoni-4.jpg";
import napThreeClubs from "../assets/decks/napoletane/bastoni-3.jpg";
import napTwoClubs from "../assets/decks/napoletane/bastoni-2.jpg";
import napEightClubs from "../assets/decks/napoletane/bastoni-8.jpg";
import napNineClubs from "../assets/decks/napoletane/bastoni-9.jpg";
import napTenClubs from "../assets/decks/napoletane/bastoni-10.jpg";

import napSevenSwords from "../assets/decks/napoletane/spade-7.jpg";
import napSixSwords from "../assets/decks/napoletane/spade-6.jpg";
import napAceSwords from "../assets/decks/napoletane/spade-1.jpg";
import napFiveSwords from "../assets/decks/napoletane/spade-5.jpg";
import napFourSwords from "../assets/decks/napoletane/spade-4.jpg";
import napThreeSwords from "../assets/decks/napoletane/spade-3.jpg";
import napTwoSwords from "../assets/decks/napoletane/spade-2.jpg";
import napEightSwords from "../assets/decks/napoletane/spade-8.jpg";
import napNineSwords from "../assets/decks/napoletane/spade-9.jpg";
import napTenSwords from "../assets/decks/napoletane/spade-10.jpg";

// Piacentine Deck Images
import piacSevenCoins from "../assets/decks/piacentine/denari-7.webp";
import piacSixCoins from "../assets/decks/piacentine/denari-6.webp";
import piacAceCoins from "../assets/decks/piacentine/denari-1.webp";
import piacFiveCoins from "../assets/decks/piacentine/denari-5.webp";
import piacFourCoins from "../assets/decks/piacentine/denari-4.webp";
import piacThreeCoins from "../assets/decks/piacentine/denari-3.webp";
import piacTwoCoins from "../assets/decks/piacentine/denari-2.webp";
import piacEightCoins from "../assets/decks/piacentine/denari-8.webp";
import piacNineCoins from "../assets/decks/piacentine/denari-9.webp";
import piacTenCoins from "../assets/decks/piacentine/denari-10.webp";

import piacSevenCups from "../assets/decks/piacentine/coppe-7.webp";
import piacSixCups from "../assets/decks/piacentine/coppe-6.webp";
import piacAceCups from "../assets/decks/piacentine/coppe-1.webp";
import piacFiveCups from "../assets/decks/piacentine/coppe-5.webp";
import piacFourCups from "../assets/decks/piacentine/coppe-4.webp";
import piacThreeCups from "../assets/decks/piacentine/coppe-3.webp";
import piacTwoCups from "../assets/decks/piacentine/coppe-2.webp";
import piacEightCups from "../assets/decks/piacentine/coppe-8.webp";
import piacNineCups from "../assets/decks/piacentine/coppe-9.webp";
import piacTenCups from "../assets/decks/piacentine/coppe-10.webp";

import piacSevenClubs from "../assets/decks/piacentine/bastoni-7.webp";
import piacSixClubs from "../assets/decks/piacentine/bastoni-6.webp";
import piacAceClubs from "../assets/decks/piacentine/bastoni-1.webp";
import piacFiveClubs from "../assets/decks/piacentine/bastoni-5.webp";
import piacFourClubs from "../assets/decks/piacentine/bastoni-4.webp";
import piacThreeClubs from "../assets/decks/piacentine/bastoni-3.webp";
import piacTwoClubs from "../assets/decks/piacentine/bastoni-2.webp";
import piacEightClubs from "../assets/decks/piacentine/bastoni-8.webp";
import piacNineClubs from "../assets/decks/piacentine/bastoni-9.webp";
import piacTenClubs from "../assets/decks/piacentine/bastoni-10.webp";

import piacSevenSwords from "../assets/decks/piacentine/spade-7.webp";
import piacSixSwords from "../assets/decks/piacentine/spade-6.webp";
import piacAceSwords from "../assets/decks/piacentine/spade-1.webp";
import piacFiveSwords from "../assets/decks/piacentine/spade-5.webp";
import piacFourSwords from "../assets/decks/piacentine/spade-4.webp";
import piacThreeSwords from "../assets/decks/piacentine/spade-3.webp";
import piacTwoSwords from "../assets/decks/piacentine/spade-2.webp";
import piacEightSwords from "../assets/decks/piacentine/spade-8.webp";
import piacNineSwords from "../assets/decks/piacentine/spade-9.webp";
import piacTenSwords from "../assets/decks/piacentine/spade-10.webp";

// Siciliane Deck Images
import sicSevenCoins from "../assets/decks/siciliane/denari-7.webp";
import sicSixCoins from "../assets/decks/siciliane/denari-6.webp";
import sicAceCoins from "../assets/decks/siciliane/denari-1.webp";
import sicFiveCoins from "../assets/decks/siciliane/denari-5.webp";
import sicFourCoins from "../assets/decks/siciliane/denari-4.webp";
import sicThreeCoins from "../assets/decks/siciliane/denari-3.webp";
import sicTwoCoins from "../assets/decks/siciliane/denari-2.webp";
import sicEightCoins from "../assets/decks/siciliane/denari-8.webp";
import sicNineCoins from "../assets/decks/siciliane/denari-9.webp";
import sicTenCoins from "../assets/decks/siciliane/denari-10.webp";

import sicSevenCups from "../assets/decks/siciliane/coppe-7.webp";
import sicSixCups from "../assets/decks/siciliane/coppe-6.webp";
import sicAceCups from "../assets/decks/siciliane/coppe-1.webp";
import sicFiveCups from "../assets/decks/siciliane/coppe-5.webp";
import sicFourCups from "../assets/decks/siciliane/coppe-4.webp";
import sicThreeCups from "../assets/decks/siciliane/coppe-3.webp";
import sicTwoCups from "../assets/decks/siciliane/coppe-2.webp";
import sicEightCups from "../assets/decks/siciliane/coppe-8.webp";
import sicNineCups from "../assets/decks/siciliane/coppe-9.webp";
import sicTenCups from "../assets/decks/siciliane/coppe-10.webp";

import sicSevenClubs from "../assets/decks/siciliane/bastoni-7.webp";
import sicSixClubs from "../assets/decks/siciliane/bastoni-6.webp";
import sicAceClubs from "../assets/decks/siciliane/bastoni-1.webp";
import sicFiveClubs from "../assets/decks/siciliane/bastoni-5.webp";
import sicFourClubs from "../assets/decks/siciliane/bastoni-4.webp";
import sicThreeClubs from "../assets/decks/siciliane/bastoni-3.webp";
import sicTwoClubs from "../assets/decks/siciliane/bastoni-2.webp";
import sicEightClubs from "../assets/decks/siciliane/bastoni-8.webp";
import sicNineClubs from "../assets/decks/siciliane/bastoni-9.webp";
import sicTenClubs from "../assets/decks/siciliane/bastoni-10.webp";

import sicSevenSwords from "../assets/decks/siciliane/spade-7.webp";
import sicSixSwords from "../assets/decks/siciliane/spade-6.webp";
import sicAceSwords from "../assets/decks/siciliane/spade-1.webp";
import sicFiveSwords from "../assets/decks/siciliane/spade-5.webp";
import sicFourSwords from "../assets/decks/siciliane/spade-4.webp";
import sicThreeSwords from "../assets/decks/siciliane/spade-3.webp";
import sicTwoSwords from "../assets/decks/siciliane/spade-2.webp";
import sicEightSwords from "../assets/decks/siciliane/spade-8.webp";
import sicNineSwords from "../assets/decks/siciliane/spade-9.webp";
import sicTenSwords from "../assets/decks/siciliane/spade-10.webp";

// Bergamasche Deck Images
import bergSevenCoins from "../assets/decks/bergamasche/denari-7.webp";
import bergSixCoins from "../assets/decks/bergamasche/denari-6.webp";
import bergAceCoins from "../assets/decks/bergamasche/denari-1.webp";
import bergFiveCoins from "../assets/decks/bergamasche/denari-5.webp";
import bergFourCoins from "../assets/decks/bergamasche/denari-4.webp";
import bergThreeCoins from "../assets/decks/bergamasche/denari-3.webp";
import bergTwoCoins from "../assets/decks/bergamasche/denari-2.webp";
import bergEightCoins from "../assets/decks/bergamasche/denari-8.webp";
import bergNineCoins from "../assets/decks/bergamasche/denari-9.webp";
import bergTenCoins from "../assets/decks/bergamasche/denari-10.webp";

import bergSevenCups from "../assets/decks/bergamasche/coppe-7.webp";
import bergSixCups from "../assets/decks/bergamasche/coppe-6.webp";
import bergAceCups from "../assets/decks/bergamasche/coppe-1.webp";
import bergFiveCups from "../assets/decks/bergamasche/coppe-5.webp";
import bergFourCups from "../assets/decks/bergamasche/coppe-4.webp";
import bergThreeCups from "../assets/decks/bergamasche/coppe-3.webp";
import bergTwoCups from "../assets/decks/bergamasche/coppe-2.webp";
import bergEightCups from "../assets/decks/bergamasche/coppe-8.webp";
import bergNineCups from "../assets/decks/bergamasche/coppe-9.webp";
import bergTenCups from "../assets/decks/bergamasche/coppe-10.webp";

import bergSevenClubs from "../assets/decks/bergamasche/bastoni-7.webp";
import bergSixClubs from "../assets/decks/bergamasche/bastoni-6.webp";
import bergAceClubs from "../assets/decks/bergamasche/bastoni-1.webp";
import bergFiveClubs from "../assets/decks/bergamasche/bastoni-5.webp";
import bergFourClubs from "../assets/decks/bergamasche/bastoni-4.webp";
import bergThreeClubs from "../assets/decks/bergamasche/bastoni-3.webp";
import bergTwoClubs from "../assets/decks/bergamasche/bastoni-2.webp";
import bergEightClubs from "../assets/decks/bergamasche/bastoni-8.webp";
import bergNineClubs from "../assets/decks/bergamasche/bastoni-9.webp";
import bergTenClubs from "../assets/decks/bergamasche/bastoni-10.webp";

import bergSevenSwords from "../assets/decks/bergamasche/spade-7.webp";
import bergSixSwords from "../assets/decks/bergamasche/spade-6.webp";
import bergAceSwords from "../assets/decks/bergamasche/spade-1.webp";
import bergFiveSwords from "../assets/decks/bergamasche/spade-5.webp";
import bergFourSwords from "../assets/decks/bergamasche/spade-4.webp";
import bergThreeSwords from "../assets/decks/bergamasche/spade-3.webp";
import bergTwoSwords from "../assets/decks/bergamasche/spade-2.webp";
import bergEightSwords from "../assets/decks/bergamasche/spade-8.webp";
import bergNineSwords from "../assets/decks/bergamasche/spade-9.webp";
import bergTenSwords from "../assets/decks/bergamasche/spade-10.webp";

// Sarde Deck
import sardeSevenCoins from "../assets/decks/sarde/denari-7.webp";
import sardeSixCoins from "../assets/decks/sarde/denari-6.webp";
import sardeAceCoins from "../assets/decks/sarde/denari-1.webp";
import sardeFiveCoins from "../assets/decks/sarde/denari-5.webp";
import sardeFourCoins from "../assets/decks/sarde/denari-4.webp";
import sardeThreeCoins from "../assets/decks/sarde/denari-3.webp";
import sardeTwoCoins from "../assets/decks/sarde/denari-2.webp";
import sardeEightCoins from "../assets/decks/sarde/denari-8.webp";
import sardeNineCoins from "../assets/decks/sarde/denari-9.webp";
import sardeTenCoins from "../assets/decks/sarde/denari-10.webp";

import sardeSevenCups from "../assets/decks/sarde/coppe-7.webp";
import sardeSixCups from "../assets/decks/sarde/coppe-6.webp";
import sardeAceCups from "../assets/decks/sarde/coppe-1.webp";
import sardeFiveCups from "../assets/decks/sarde/coppe-5.webp";
import sardeFourCups from "../assets/decks/sarde/coppe-4.webp";
import sardeThreeCups from "../assets/decks/sarde/coppe-3.webp";
import sardeTwoCups from "../assets/decks/sarde/coppe-2.webp";
import sardeEightCups from "../assets/decks/sarde/coppe-8.webp";
import sardeNineCups from "../assets/decks/sarde/coppe-9.webp";
import sardeTenCups from "../assets/decks/sarde/coppe-10.webp";

import sardeSevenClubs from "../assets/decks/sarde/bastoni-7.webp";
import sardeSixClubs from "../assets/decks/sarde/bastoni-6.webp";
import sardeAceClubs from "../assets/decks/sarde/bastoni-1.webp";
import sardeFiveClubs from "../assets/decks/sarde/bastoni-5.webp";
import sardeFourClubs from "../assets/decks/sarde/bastoni-4.webp";
import sardeThreeClubs from "../assets/decks/sarde/bastoni-3.webp";
import sardeTwoClubs from "../assets/decks/sarde/bastoni-2.webp";
import sardeEightClubs from "../assets/decks/sarde/bastoni-8.webp";
import sardeNineClubs from "../assets/decks/sarde/bastoni-9.webp";
import sardeTenClubs from "../assets/decks/sarde/bastoni-10.webp";

import sardeSevenSwords from "../assets/decks/sarde/spade-7.webp";
import sardeSixSwords from "../assets/decks/sarde/spade-6.webp";
import sardeAceSwords from "../assets/decks/sarde/spade-1.webp";
import sardeFiveSwords from "../assets/decks/sarde/spade-5.webp";
import sardeFourSwords from "../assets/decks/sarde/spade-4.webp";
import sardeThreeSwords from "../assets/decks/sarde/spade-3.webp";
import sardeTwoSwords from "../assets/decks/sarde/spade-2.webp";
import sardeEightSwords from "../assets/decks/sarde/spade-8.webp";
import sardeNineSwords from "../assets/decks/sarde/spade-9.webp";
import sardeTenSwords from "../assets/decks/sarde/spade-10.webp";

// Suit icons (shared across card table)
import coin from "../assets/denare.png";
import cup from "../assets/coppa.png";
import club from "../assets/bastone.png";
import sword from "../assets/spada.png";

export const DECK_STORAGE_KEY = "sweeper_selected_deck";

export function loadSelectedDeck(): DeckStyle {
  try {
    const saved = localStorage.getItem(DECK_STORAGE_KEY);
    if (
      saved === "piacentine" ||
      saved === "napoletane" ||
      saved === "siciliane" ||
      saved === "bergamasche" ||
      saved === "sarde"
    ) {
      return saved;
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

const DECK_IMAGES: Record<DeckStyle, Record<Suits, Record<CardValue, string>>> = {
  napoletane: {
    coins: {
      seven: napSevenCoins,
      six: napSixCoins,
      ace: napAceCoins,
      five: napFiveCoins,
      four: napFourCoins,
      three: napThreeCoins,
      two: napTwoCoins,
      jack: napEightCoins,
      horse: napNineCoins,
      king: napTenCoins,
    },
    cups: {
      seven: napSevenCups,
      six: napSixCups,
      ace: napAceCups,
      five: napFiveCups,
      four: napFourCups,
      three: napThreeCups,
      two: napTwoCups,
      jack: napEightCups,
      horse: napNineCups,
      king: napTenCups,
    },
    clubs: {
      seven: napSevenClubs,
      six: napSixClubs,
      ace: napAceClubs,
      five: napFiveClubs,
      four: napFourClubs,
      three: napThreeClubs,
      two: napTwoClubs,
      jack: napEightClubs,
      horse: napNineClubs,
      king: napTenClubs,
    },
    swords: {
      seven: napSevenSwords,
      six: napSixSwords,
      ace: napAceSwords,
      five: napFiveSwords,
      four: napFourSwords,
      three: napThreeSwords,
      two: napTwoSwords,
      jack: napEightSwords,
      horse: napNineSwords,
      king: napTenSwords,
    },
  },
  piacentine: {
    coins: {
      seven: piacSevenCoins,
      six: piacSixCoins,
      ace: piacAceCoins,
      five: piacFiveCoins,
      four: piacFourCoins,
      three: piacThreeCoins,
      two: piacTwoCoins,
      jack: piacEightCoins,
      horse: piacNineCoins,
      king: piacTenCoins,
    },
    cups: {
      seven: piacSevenCups,
      six: piacSixCups,
      ace: piacAceCups,
      five: piacFiveCups,
      four: piacFourCups,
      three: piacThreeCups,
      two: piacTwoCups,
      jack: piacEightCups,
      horse: piacNineCups,
      king: piacTenCups,
    },
    clubs: {
      seven: piacSevenClubs,
      six: piacSixClubs,
      ace: piacAceClubs,
      five: piacFiveClubs,
      four: piacFourClubs,
      three: piacThreeClubs,
      two: piacTwoClubs,
      jack: piacEightClubs,
      horse: piacNineClubs,
      king: piacTenClubs,
    },
    swords: {
      seven: piacSevenSwords,
      six: piacSixSwords,
      ace: piacAceSwords,
      five: piacFiveSwords,
      four: piacFourSwords,
      three: piacThreeSwords,
      two: piacTwoSwords,
      jack: piacEightSwords,
      horse: piacNineSwords,
      king: piacTenSwords,
    },
  },
  siciliane: {
    coins: {
      seven: sicSevenCoins,
      six: sicSixCoins,
      ace: sicAceCoins,
      five: sicFiveCoins,
      four: sicFourCoins,
      three: sicThreeCoins,
      two: sicTwoCoins,
      jack: sicEightCoins,
      horse: sicNineCoins,
      king: sicTenCoins,
    },
    cups: {
      seven: sicSevenCups,
      six: sicSixCups,
      ace: sicAceCups,
      five: sicFiveCups,
      four: sicFourCups,
      three: sicThreeCups,
      two: sicTwoCups,
      jack: sicEightCups,
      horse: sicNineCups,
      king: sicTenCups,
    },
    clubs: {
      seven: sicSevenClubs,
      six: sicSixClubs,
      ace: sicAceClubs,
      five: sicFiveClubs,
      four: sicFourClubs,
      three: sicThreeClubs,
      two: sicTwoClubs,
      jack: sicEightClubs,
      horse: sicNineClubs,
      king: sicTenClubs,
    },
    swords: {
      seven: sicSevenSwords,
      six: sicSixSwords,
      ace: sicAceSwords,
      five: sicFiveSwords,
      four: sicFourSwords,
      three: sicThreeSwords,
      two: sicTwoSwords,
      jack: sicEightSwords,
      horse: sicNineSwords,
      king: sicTenSwords,
    },
  },
  bergamasche: {
    coins: {
      seven: bergSevenCoins,
      six: bergSixCoins,
      ace: bergAceCoins,
      five: bergFiveCoins,
      four: bergFourCoins,
      three: bergThreeCoins,
      two: bergTwoCoins,
      jack: bergEightCoins,
      horse: bergNineCoins,
      king: bergTenCoins,
    },
    cups: {
      seven: bergSevenCups,
      six: bergSixCups,
      ace: bergAceCups,
      five: bergFiveCups,
      four: bergFourCups,
      three: bergThreeCups,
      two: bergTwoCups,
      jack: bergEightCups,
      horse: bergNineCups,
      king: bergTenCups,
    },
    clubs: {
      seven: bergSevenClubs,
      six: bergSixClubs,
      ace: bergAceClubs,
      five: bergFiveClubs,
      four: bergFourClubs,
      three: bergThreeClubs,
      two: bergTwoClubs,
      jack: bergEightClubs,
      horse: bergNineClubs,
      king: bergTenClubs,
    },
    swords: {
      seven: bergSevenSwords,
      six: bergSixSwords,
      ace: bergAceSwords,
      five: bergFiveSwords,
      four: bergFourSwords,
      three: bergThreeSwords,
      two: bergTwoSwords,
      jack: bergEightSwords,
      horse: bergNineSwords,
      king: bergTenSwords,
    },
  },
  sarde: {
    coins: {
      seven: sardeSevenCoins,
      six: sardeSixCoins,
      ace: sardeAceCoins,
      five: sardeFiveCoins,
      four: sardeFourCoins,
      three: sardeThreeCoins,
      two: sardeTwoCoins,
      jack: sardeEightCoins,
      horse: sardeNineCoins,
      king: sardeTenCoins,
    },
    cups: {
      seven: sardeSevenCups,
      six: sardeSixCups,
      ace: sardeAceCups,
      five: sardeFiveCups,
      four: sardeFourCups,
      three: sardeThreeCups,
      two: sardeTwoCups,
      jack: sardeEightCups,
      horse: sardeNineCups,
      king: sardeTenCups,
    },
    clubs: {
      seven: sardeSevenClubs,
      six: sardeSixClubs,
      ace: sardeAceClubs,
      five: sardeFiveClubs,
      four: sardeFourClubs,
      three: sardeThreeClubs,
      two: sardeTwoClubs,
      jack: sardeEightClubs,
      horse: sardeNineClubs,
      king: sardeTenClubs,
    },
    swords: {
      seven: sardeSevenSwords,
      six: sardeSixSwords,
      ace: sardeAceSwords,
      five: sardeFiveSwords,
      four: sardeFourSwords,
      three: sardeThreeSwords,
      two: sardeTwoSwords,
      jack: sardeEightSwords,
      horse: sardeNineSwords,
      king: sardeTenSwords,
    },
  },
};

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
