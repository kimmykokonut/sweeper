import { useEffect } from "react";
import type { Suits, CardValue } from "../types";
import { CARD_DATA } from "../utils/cardData";

interface CardSelectorProps {
  activeSuit: Suits | null;
  onClose: () => void;
  onCardSelect: (suit: Suits, value: CardValue) => void;
  takenCards?: Partial<Record<CardValue, string>>;
  currentSelection?: CardValue | null;
}
// Modal for user to select highest card in a suit
function CardSelector({
  activeSuit,
  onClose,
  onCardSelect,
  takenCards,
  currentSelection,
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
      className="fixed inset-0 z-70 flex items-center justify-center overflow-y-auto bg-black/75 p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xs cursor-pointer"
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
        className="relative flex w-full max-w-xl sm:max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[92vh] flex-col rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl text-white overflow-hidden cursor-default"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-emerald-800 bg-emerald-950/80 px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2">
            <img
              src={CARD_DATA[activeSuit].icon}
              alt=""
              aria-hidden="true"
              className="size-6 sm:size-7 object-contain"
            />
            <span
              id="card-selector-title"
              className="text-base sm:text-lg font-bold text-white"
            >
              {CARD_DATA[activeSuit].displayName}
            </span>
            <span className="text-xs sm:text-sm text-emerald-300 font-medium">
              • Select highest card
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close card picker"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800/70 transition-colors cursor-pointer text-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-3 flex flex-col gap-2 sm:gap-2.5">
          {/* Top Hero: 7 (Best Card in Suit) */}
          {sevenCard && (() => {
            const takenBy = takenCards?.[sevenCard.value];
            const isSelectedByCurrent = currentSelection === sevenCard.value;
            const isDisabled = Boolean(takenBy);

            return (
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && onCardSelect(activeSuit, sevenCard.value)}
                className={`w-full grid grid-cols-3 items-center px-3 py-1.5 sm:py-2 rounded-xl transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                  isDisabled
                    ? "bg-emerald-950/40 border border-emerald-900/60 opacity-60 cursor-not-allowed"
                    : isSelectedByCurrent
                      ? "bg-emerald-800/90 border-2 border-yellow-400 ring-2 ring-yellow-400/50 shadow-lg cursor-pointer"
                      : "bg-emerald-950/60 border border-emerald-700/80 hover:bg-emerald-800/50 hover:border-emerald-500 cursor-pointer group"
                }`}
                title={takenBy ? `Taken by ${takenBy}` : undefined}
                aria-disabled={isDisabled}
              >
                {/* Left Column: 7 / Status */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left pl-1 sm:pl-3">
                  <span
                    className={`text-3xl sm:text-4xl font-extrabold leading-none ${
                      isDisabled ? "text-emerald-500/70" : "text-white"
                    }`}
                  >
                    7
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-bold uppercase tracking-wider mt-1 ${
                      takenBy
                        ? "text-amber-300 flex items-center gap-1"
                        : "text-yellow-400"
                    }`}
                  >
                    {takenBy ? `Taken by ${takenBy}` : "Best Card"}
                  </span>
                </div>

                {/* Center Column: Card Image */}
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <img
                      src={sevenCard.image}
                      alt="7"
                      className={`h-24 sm:h-28 aspect-[2/3] object-contain rounded-lg bg-white p-1 shadow-sm border border-emerald-800/50 transition-transform ${
                        isDisabled
                          ? "opacity-50 grayscale-40"
                          : "group-hover:scale-105"
                      }`}
                    />
                    {takenBy && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-5xl drop-shadow-md">🔒</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: 21 / POINTS */}
                <div className="flex flex-col items-center sm:items-end text-center sm:text-right pr-1 sm:pr-3">
                  <span
                    className={`text-3xl sm:text-4xl font-extrabold leading-none ${
                      isDisabled ? "text-emerald-500/70" : "text-yellow-300"
                    }`}
                  >
                    21
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-bold uppercase tracking-wider mt-1 ${
                      isDisabled ? "text-emerald-500/70" : "text-emerald-300"
                    }`}
                  >
                    Points
                  </span>
                </div>
              </button>
            );
          })()}

          {/* 3x3 Grid for Remaining 9 Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {remainingCards.map((card) => {
              const isHighTier = card.points >= 15;
              const takenBy = takenCards?.[card.value];
              const isSelectedByCurrent = currentSelection === card.value;
              const isDisabled = Boolean(takenBy);

              return (
                <button
                  key={card.value}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => !isDisabled && onCardSelect(activeSuit, card.value)}
                  className={`group relative flex aspect-[2/3] flex-col items-center justify-between overflow-hidden rounded-xl p-1.5 shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                    isDisabled
                      ? "bg-emerald-950/40 border border-emerald-900/60 opacity-60 cursor-not-allowed"
                      : isSelectedByCurrent
                        ? "bg-white ring-2 ring-yellow-400 scale-[1.02] cursor-pointer shadow-lg"
                        : "bg-white hover:scale-105 active:scale-95 cursor-pointer hover:ring-2 hover:ring-emerald-400"
                  }`}
                  title={takenBy ? `Taken by ${takenBy}` : undefined}
                  aria-disabled={isDisabled}
                >
                  <div className="relative w-full flex-1 flex items-center justify-center min-h-0">
                    <img
                      src={card.image}
                      alt={`${card.displayName} of ${CARD_DATA[activeSuit].name}`}
                      className={`h-full w-full object-contain ${
                        isDisabled ? "opacity-40 grayscale-40" : ""
                      }`}
                    />
                    {takenBy && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-center bg-emerald-950/90 text-amber-300 px-1.5 py-0.5 rounded text-xs sm:text-sm font-bold shadow-md flex items-center gap-1 border border-emerald-800">
                          <span>🔒</span>
                          <span className="truncate max-w-[70px] sm:max-w-[90px]">{takenBy}</span>
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    className={`w-full py-0.5 sm:py-1 text-center text-xs sm:text-sm font-bold rounded-md leading-tight mt-1 truncate px-0.5 border ${
                      takenBy
                        ? "bg-emerald-950/90 text-amber-300/90 border-emerald-800 text-[11px]"
                        : isHighTier
                          ? "bg-emerald-950 text-yellow-300 border-yellow-400/40 shadow-xs"
                          : "bg-emerald-950/90 text-emerald-100 border-emerald-800/70"
                    }`}
                  >
                    {takenBy ? `Taken` : `${card.points} pts`}
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
