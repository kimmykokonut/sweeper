import type { CardValue, Suits } from "../types";
import tenCoins from "../assets/decks/napoletane/denari-10.jpg";
import nineCoins from "../assets/decks/napoletane/denari-9.jpg";
import eightCoins from "../assets/decks/napoletane/denari-8.jpg";
import sevenCoins from "../assets/decks/napoletane/denari-7.jpg";
import sixCoins from "../assets/decks/napoletane/denari-6.jpg";
import fiveCoins from "../assets/decks/napoletane/denari-5.jpg";
import fourCoins from "../assets/decks/napoletane/denari-4.jpg";
import threeCoins from "../assets/decks/napoletane/denari-3.jpg";
import twoCoins from "../assets/decks/napoletane/denari-2.jpg";
import aceCoins from "../assets/decks/napoletane/denari-1.jpg";
import aceCups from "../assets/decks/napoletane/coppe-1.jpg";
import twoCups from "../assets/decks/napoletane/coppe-2.jpg";
import threeCups from "../assets/decks/napoletane/coppe-3.jpg";
import fourCups from "../assets/decks/napoletane/coppe-4.jpg";
import fiveCups from "../assets/decks/napoletane/coppe-5.jpg";
import sixCups from "../assets/decks/napoletane/coppe-6.jpg";
import sevenCups from "../assets/decks/napoletane/coppe-7.jpg";
import eightCups from "../assets/decks/napoletane/coppe-8.jpg";
import nineCups from "../assets/decks/napoletane/coppe-9.jpg";
import tenCups from "../assets/decks/napoletane/coppe-10.jpg";
import aceClubs from "../assets/decks/napoletane/bastoni-1.jpg";
import twoClubs from "../assets/decks/napoletane/bastoni-2.jpg";
import threeClubs from "../assets/decks/napoletane/bastoni-3.jpg";
import fourClubs from "../assets/decks/napoletane/bastoni-4.jpg";
import fiveClubs from "../assets/decks/napoletane/bastoni-5.jpg";
import sixClubs from "../assets/decks/napoletane/bastoni-6.jpg";
import sevenClubs from "../assets/decks/napoletane/bastoni-7.jpg";
import eightClubs from "../assets/decks/napoletane/bastoni-8.jpg";
import nineClubs from "../assets/decks/napoletane/bastoni-9.jpg";
import tenClubs from "../assets/decks/napoletane/bastoni-10.jpg";
import aceSwords from "../assets/decks/napoletane/spade-1.jpg";
import twoSwords from "../assets/decks/napoletane/spade-2.jpg";
import threeSwords from "../assets/decks/napoletane/spade-3.jpg";
import fourSwords from "../assets/decks/napoletane/spade-4.jpg";
import fiveSwords from "../assets/decks/napoletane/spade-5.jpg";
import sixSwords from "../assets/decks/napoletane/spade-6.jpg";
import sevenSwords from "../assets/decks/napoletane/spade-7.jpg";
import eightSwords from "../assets/decks/napoletane/spade-8.jpg";
import nineSwords from "../assets/decks/napoletane/spade-9.jpg";
import tenSwords from "../assets/decks/napoletane/spade-10.jpg";
import coin from "../assets/denare.png";
import cup from "../assets/coppa.png";
import club from "../assets/bastone.png";
import sword from "../assets/spada.png";

export const CARD_DATA: Record<
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
> = {
  coins: {
    name: "Coins",
    displayName: "Denari",
    icon: coin,
    cards: [
      { value: "seven", image: sevenCoins, displayName: "7", points: 21 },
      { value: "six", image: sixCoins, displayName: "6", points: 18 },
      { value: "ace", image: aceCoins, displayName: "A", points: 16 },
      { value: "five", image: fiveCoins, displayName: "5", points: 15 },
      { value: "four", image: fourCoins, displayName: "4", points: 14 },
      { value: "three", image: threeCoins, displayName: "3", points: 13 },
      { value: "two", image: twoCoins, displayName: "2", points: 12 },
      { value: "jack", image: eightCoins, displayName: "Jack", points: 10 },
      { value: "horse", image: nineCoins, displayName: "Horse", points: 10 },
      { value: "king", image: tenCoins, displayName: "King", points: 10 },
    ],
  },
  cups: {
    name: "Cups",
    displayName: "Coppe",
    icon: cup,
    cards: [
      { value: "seven", image: sevenCups, displayName: "7", points: 21 },
      { value: "six", image: sixCups, displayName: "6", points: 18 },
      { value: "ace", image: aceCups, displayName: "A", points: 16 },
      { value: "five", image: fiveCups, displayName: "5", points: 15 },
      { value: "four", image: fourCups, displayName: "4", points: 14 },
      { value: "three", image: threeCups, displayName: "3", points: 13 },
      { value: "two", image: twoCups, displayName: "2", points: 12 },
      { value: "jack", image: eightCups, displayName: "Jack", points: 10 },
      { value: "horse", image: nineCups, displayName: "Horse", points: 10 },
      { value: "king", image: tenCups, displayName: "King", points: 10 },
    ],
  },
  clubs: {
    name: "Clubs",
    displayName: "Bastoni",
    icon: club,
    cards: [
      { value: "seven", image: sevenClubs, displayName: "7", points: 21 },
      { value: "six", image: sixClubs, displayName: "6", points: 18 },
      { value: "ace", image: aceClubs, displayName: "A", points: 16 },
      { value: "five", image: fiveClubs, displayName: "5", points: 15 },
      { value: "four", image: fourClubs, displayName: "4", points: 14 },
      { value: "three", image: threeClubs, displayName: "3", points: 13 },
      { value: "two", image: twoClubs, displayName: "2", points: 12 },
      { value: "jack", image: eightClubs, displayName: "Jack", points: 10 },
      { value: "horse", image: nineClubs, displayName: "Horse", points: 10 },
      { value: "king", image: tenClubs, displayName: "King", points: 10 },
    ],
  },
  swords: {
    name: "Swords",
    displayName: "Spade",
    icon: sword,
    cards: [
      { value: "seven", image: sevenSwords, displayName: "7", points: 21 },
      { value: "six", image: sixSwords, displayName: "6", points: 18 },
      { value: "ace", image: aceSwords, displayName: "A", points: 16 },
      { value: "five", image: fiveSwords, displayName: "5", points: 15 },
      { value: "four", image: fourSwords, displayName: "4", points: 14 },
      { value: "three", image: threeSwords, displayName: "3", points: 13 },
      { value: "two", image: twoSwords, displayName: "2", points: 12 },
      { value: "jack", image: eightSwords, displayName: "Jack", points: 10 },
      { value: "horse", image: nineSwords, displayName: "Horse", points: 10 },
      { value: "king", image: tenSwords, displayName: "King", points: 10 },
    ],
  },
};

export const getCardImage = (suit: Suits, value: CardValue) => {
  return CARD_DATA[suit].cards.find((card) => card.value === value)?.image;
};
