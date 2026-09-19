import type { Suits, CardValue } from "../types";
import { CARD_DATA } from "../utils/cardData";

interface CardSelectorProps {
  activeSuit: Suits | null;
  onClose: () => void;
  onCardSelect: (suit: Suits, value: CardValue) => void;
  usedCards?: Set<string>;
}

// Modal that covers Calc Screen for user to select card by suit
function CardSelector({
  activeSuit,
  onClose,
  onCardSelect,
}: CardSelectorProps) {
  if (!activeSuit) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-black/60 p-3"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-selector-title"
    >
      <div
        className="mx-auto flex w-full max-w-5xl flex-col rounded-xl bg-emerald-50 p-3 shadow-2xl sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative mb-4">
          <h3
            id="card-selector-title"
            className="text-center text-2xl font-bold text-emerald-800"
          >
            {CARD_DATA[activeSuit].displayName}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-md px-3 py-2 font-semibold text-emerald-800 hover:bg-gray-800"
          >
            X
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {CARD_DATA[activeSuit].cards.map((card) => (
            <button
              key={card.value}
              type="button"
              onClick={() => onCardSelect(activeSuit, card.value)}
              // disabled={usedCards.has(`${activeSuit}-${card.value}`)}
              // className={
              //   usedCards.has(`${activeSuit}-${card.value}`)
              //     ? "opacity-30 grayscale"
              //     : ""
              // }
              className="flex aspect-[2/3] items-center justify-center overflow-hidden rounded-lg border border-emerald-100 bg-white p-2 shadow-md transition hover:scale-[1.02] hover:ring-2 hover:ring-emerald-800"
            >
              <img
                src={card.image}
                alt={`${card.displayName} of ${CARD_DATA[activeSuit].name}`}
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>
        <div className="bg-yellow-100 p-2 mt-2 rounded text-sm">
          <p>
            <strong>Primiera values:</strong> 7=21, 6=18, A=16, 5=15, 4=14,
            3=13, 2=12, Face=10
          </p>
          <p>Choose your best card from each suit!</p>
        </div>
      </div>
    </div>
  );
}

export default CardSelector;
