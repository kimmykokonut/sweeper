import { useEffect } from "react";
import type { Suits, CardValue } from "../types";
import { CARD_DATA } from "../utils/cardData";

interface CardSelectorProps {
  activeSuit: Suits | null;
  onClose: () => void;
  onCardSelect: (suit: Suits, value: CardValue) => void;
  usedCards?: Set<string>;
}
// Modal for user to select highest card in a suit
function CardSelector({
  activeSuit,
  onClose,
  onCardSelect,
}: CardSelectorProps) {
  // Close card selector on Escape key press without closing parent modal
  useEffect(() => {
    if (!activeSuit) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [activeSuit, onClose]);

  if (!activeSuit) return null;

  const cards = CARD_DATA[activeSuit].cards;
  const sevenCard = cards.find((c) => c.value === "seven");
  const remainingCards = cards.filter((c) => c.value !== "seven");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-3 sm:p-4 backdrop-blur-xs cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.stopPropagation();
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-selector-title"
    >
      <div
        className="relative flex w-full max-w-xl sm:max-w-2xl max-h-[92vh] flex-col rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl text-white overflow-hidden cursor-default"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-800 bg-emerald-950/80 px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2">
            <img
              src={CARD_DATA[activeSuit].icon}
              alt=""
              className="size-5 object-contain"
            />
            <span
              id="card-selector-title"
              className="text-sm sm:text-base font-bold text-white"
            >
              {CARD_DATA[activeSuit].displayName}
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              • Select highest card
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close card picker"
            className="rounded-lg p-1 text-emerald-300 hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer text-base"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 flex flex-col gap-2 sm:gap-2.5">
          {/* Top Hero: 7 (Best Card in Suit) */}
          {sevenCard && (
            <button
              type="button"
              onClick={() => onCardSelect(activeSuit, sevenCard.value)}
              className="w-full grid grid-cols-3 items-center px-3 py-1.5 sm:py-2 rounded-xl bg-emerald-950/60 border border-emerald-700/80 hover:bg-emerald-800/50 hover:border-emerald-500 transition-all shadow-md cursor-pointer group"
            >
              {/* Left Column: 7 / BEST CARD */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left pl-1 sm:pl-3">
                <span className="text-3xl sm:text-4xl font-black text-white leading-none">
                  7
                </span>
                <span className="text-xs sm:text-sm font-black text-yellow-400 uppercase tracking-wider mt-1">
                  Best Card
                </span>
              </div>

              {/* Center Column: Card Image */}
              <div className="flex items-center justify-center">
                <img
                  src={sevenCard.image}
                  alt="7"
                  className="h-24 sm:h-28 aspect-[2/3] object-contain rounded-lg bg-white p-1 shadow-sm border border-emerald-800/50 transition-transform group-hover:scale-105"
                />
              </div>

              {/* Right Column: 21 / POINTS */}
              <div className="flex flex-col items-center sm:items-end text-center sm:text-right pr-1 sm:pr-3">
                <span className="text-3xl sm:text-4xl font-black text-yellow-300 leading-none">
                  21
                </span>
                <span className="text-xs sm:text-sm font-black text-emerald-300 uppercase tracking-wider mt-1">
                  Points
                </span>
              </div>
            </button>
          )}

          {/* 3x3 Grid for Remaining 9 Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {remainingCards.map((card) => {
              const isHighTier = card.points >= 15;
              return (
                <button
                  key={card.value}
                  type="button"
                  onClick={() => onCardSelect(activeSuit, card.value)}
                  className="group relative flex aspect-[2/3] flex-col items-center justify-between overflow-hidden rounded-xl bg-white p-1.5 shadow transition-all hover:scale-105 active:scale-95 cursor-pointer hover:ring-2 hover:ring-emerald-400"
                >
                  <img
                    src={card.image}
                    alt={`${card.displayName} of ${CARD_DATA[activeSuit].name}`}
                    className="h-full w-full object-contain min-h-0 flex-1"
                  />
                  <div
                    className={`w-full py-0.5 sm:py-1 text-center text-xs sm:text-sm font-extrabold rounded-md leading-tight mt-1 ${
                      isHighTier
                        ? "bg-emerald-800 text-white"
                        : "bg-emerald-950/85 text-emerald-200"
                    }`}
                  >
                    {card.points} pts
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardSelector;
