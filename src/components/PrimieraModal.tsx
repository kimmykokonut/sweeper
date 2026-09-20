import { useState } from "react";
import type { CardSelections, CardValue, Player, Suits } from "../types";
import { CARD_DATA, getCardImage } from "../utils/cardData";
import {
  calculatePrimieraScore,
  primieraValues,
} from "../utils/primieraCalculator";
import CardSelector from "./CardSelector";

interface PrimieraModalProps {
  players: Player[];
  onApplyWinner: (
    winnerId: string | null,
    scores: Record<string, number>
  ) => void;
  onClose: () => void;
}

export default function PrimieraModal({
  players,
  onApplyWinner,
  onClose,
}: PrimieraModalProps) {
  // Store selections per player ID
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    players[0]?.id || "0"
  );
  const [allSelections, setAllSelections] = useState<
    Record<string, CardSelections>
  >(() => {
    const initial: Record<string, CardSelections> = {};
    for (const p of players) {
      initial[p.id] = { coins: null, cups: null, swords: null, clubs: null };
    }
    return initial;
  });

  const [activeSuit, setActiveSuit] = useState<Suits | null>(null);

  // Calculate scores for all players who have selections
  const playerScores: Record<string, number> = {};
  for (const p of players) {
    playerScores[p.id] = calculatePrimieraScore(allSelections[p.id]);
  }

  // Determine winner if at least two players have valid scores
  const allCalculated = players.every(
    (p) =>
      allSelections[p.id]?.coins &&
      allSelections[p.id]?.cups &&
      allSelections[p.id]?.swords &&
      allSelections[p.id]?.clubs
  );

  let winnerId: string | null = null;
  let isTie = false;

  if (allCalculated) {
    const sorted = [...players].sort(
      (a, b) => playerScores[b.id] - playerScores[a.id]
    );
    if (sorted.length > 1 && playerScores[sorted[0].id] === playerScores[sorted[1].id]) {
      isTie = true;
      winnerId = null;
    } else if (sorted.length > 0) {
      winnerId = sorted[0].id;
    }
  }

  const currentSelections = allSelections[selectedPlayerId] || {
    coins: null,
    cups: null,
    swords: null,
    clubs: null,
  };

  const handleCardSelect = (suit: Suits, value: CardValue) => {
    setAllSelections((prev) => ({
      ...prev,
      [selectedPlayerId]: {
        ...prev[selectedPlayerId],
        [suit]: value,
      },
    }));
    setActiveSuit(null);
  };

  const handleClearPlayerCards = () => {
    setAllSelections((prev) => ({
      ...prev,
      [selectedPlayerId]: {
        coins: null,
        cups: null,
        swords: null,
        clubs: null,
      },
    }));
  };

  const handleApply = () => {
    onApplyWinner(winnerId, playerScores);
  };

  const currentScore = playerScores[selectedPlayerId] || 0;
  const suits: Suits[] = ["coins", "cups", "swords", "clubs"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-800 bg-emerald-950/70 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎴</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Primiera Calculator
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-emerald-300 hover:bg-emerald-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Player Selector Tabs */}
        <div className="flex border-b border-emerald-800 bg-emerald-950/40 p-2 overflow-x-auto gap-2">
          {players.map((p) => {
            const score = playerScores[p.id];
            const isSelected = p.id === selectedPlayerId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlayerId(p.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800"
                }`}
              >
                <span>{p.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                    isSelected ? "bg-emerald-800 text-yellow-300" : "bg-emerald-950 text-emerald-300"
                  }`}
                >
                  {score > 0 ? `${score} pts` : "—"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm sm:text-base text-emerald-100 font-medium">
              Select best card in each suit for{" "}
              <span className="font-bold text-yellow-300">
                {players.find((p) => p.id === selectedPlayerId)?.name}
              </span>
              :
            </p>
            <button
              type="button"
              onClick={handleClearPlayerCards}
              className="text-xs text-emerald-300 hover:text-white underline underline-offset-2"
            >
              Clear cards
            </button>
          </div>

          {/* 4 Card Suit Slots */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {suits.map((suit) => {
              const selectedValue = currentSelections[suit];
              return (
                <button
                  key={suit}
                  type="button"
                  onClick={() => setActiveSuit(suit)}
                  className={`group relative flex aspect-[2/3] flex-col items-center justify-center rounded-xl p-1.5 transition-all shadow-md ${
                    selectedValue
                      ? "bg-white ring-2 ring-yellow-400 hover:ring-yellow-300"
                      : "bg-emerald-800/80 border-2 border-dashed border-emerald-600 hover:border-emerald-400 hover:bg-emerald-700/60"
                  }`}
                >
                  {selectedValue ? (
                    <div className="flex h-full w-full flex-col items-center justify-center">
                      <img
                        src={getCardImage(suit, selectedValue)}
                        alt={`${selectedValue} of ${suit}`}
                        className="min-h-0 w-full flex-1 object-contain"
                      />
                      <div className="mt-1 flex items-center justify-between w-full px-1 text-xs font-bold text-emerald-900 bg-emerald-100 rounded">
                        <span className="capitalize">{suit}</span>
                        <span className="text-emerald-700">
                          {primieraValues[selectedValue]} pts
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5 p-2 text-center">
                      <img
                        src={CARD_DATA[suit].icon}
                        alt={`${CARD_DATA[suit].name} suit`}
                        className="h-10 w-10 sm:h-12 sm:w-12 object-contain transition-transform group-hover:scale-110"
                      />
                      <span className="text-xs font-semibold text-emerald-200">
                        {CARD_DATA[suit].displayName}
                      </span>
                      <span className="text-[10px] text-emerald-400">
                        Tap to choose
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Player Total */}
          <div className="flex items-center justify-between rounded-xl bg-emerald-950/60 border border-emerald-800 px-4 py-2.5">
            <span className="text-sm text-emerald-200 font-medium">
              {players.find((p) => p.id === selectedPlayerId)?.name} Primiera Total:
            </span>
            <span className="text-xl font-extrabold text-yellow-300">
              {currentScore} pts
            </span>
          </div>

          {/* Outcome Summary Box */}
          <div className="rounded-xl bg-emerald-950/80 border border-emerald-700/80 p-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-2">
              Current Comparison
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              {players.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-lg p-2 border ${
                    winnerId === p.id
                      ? "bg-emerald-800/90 border-yellow-400 ring-1 ring-yellow-400"
                      : "bg-emerald-900/40 border-emerald-800"
                  }`}
                >
                  <div className="truncate text-xs font-medium text-emerald-200">
                    {p.name}
                  </div>
                  <div className="text-lg font-bold text-white">
                    {playerScores[p.id]}
                  </div>
                  {winnerId === p.id && (
                    <span className="inline-block mt-0.5 text-[11px] font-bold text-yellow-300">
                      👑 Highest
                    </span>
                  )}
                </div>
              ))}
            </div>

            {allCalculated && (
              <div className="mt-3 text-center text-sm font-semibold">
                {winnerId ? (
                  <span className="text-yellow-300">
                    🏆 {players.find((p) => p.id === winnerId)?.name} wins the
                    Primiera point!
                  </span>
                ) : isTie ? (
                  <span className="text-amber-200">
                    ⚖️ Tie! No Primiera point awarded.
                  </span>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-emerald-800 bg-emerald-950/70 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 font-semibold text-emerald-200 hover:bg-emerald-800 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!allCalculated}
            className={`rounded-xl px-5 py-2.5 font-bold shadow-lg transition-all text-sm flex items-center gap-1.5 ${
              allCalculated
                ? "bg-yellow-400 text-emerald-950 hover:bg-yellow-300 hover:scale-105 cursor-pointer"
                : "bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed"
            }`}
          >
            <span>Apply to Round</span>
            <span>✓</span>
          </button>
        </div>
      </div>

      {/* Card Selector Modal */}
      {activeSuit && (
        <CardSelector
          activeSuit={activeSuit}
          onClose={() => setActiveSuit(null)}
          onCardSelect={handleCardSelect}
        />
      )}
    </div>
  );
}
