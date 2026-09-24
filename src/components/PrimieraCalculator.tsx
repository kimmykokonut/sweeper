import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import type {
  CardSelections,
  CardValue,
  GameState,
  Player,
  Suits,
} from "../types";
import { CARD_DATA, getCardImage } from "../utils/cardData";
import {
  calculatePrimieraScore,
  primieraValues,
} from "../utils/primieraCalculator";
import CardSelector from "./CardSelector";
import { saveGameState } from "../utils/scorecardHelpers";

export interface PrimieraCalculatorProps {
  /**
   * Players list. If provided (e.g. from active game in scorecard), these players are used.
   * If omitted (standalone page), players can be configured (2–4 players).
   */
  players?: Player[];

  /**
   * Display mode: "modal" (rendered in dialog popup) or "page" (standalone full-page view).
   * Default: "page"
   */
  mode?: "modal" | "page";

  /**
   * Callback when "Apply to Round" is clicked (in modal mode).
   */
  onApplyWinner?: (
    winnerId: string | null,
    scores: Record<string, number>,
  ) => void;

  /**
   * Callback to close modal or cancel (in modal mode).
   */
  onClose?: () => void;
}

const SUITS: Suits[] = ["coins", "cups", "swords", "clubs"];

const EMPTY_SELECTIONS: CardSelections = {
  coins: null,
  cups: null,
  swords: null,
  clubs: null,
};

/**
 * Calculates running score for any selected cards (even if < 4 suits selected).
 */
function getRunningScore(selections?: CardSelections): number {
  if (!selections) return 0;
  let sum = 0;
  if (selections.coins) sum += primieraValues[selections.coins];
  if (selections.cups) sum += primieraValues[selections.cups];
  if (selections.swords) sum += primieraValues[selections.swords];
  if (selections.clubs) sum += primieraValues[selections.clubs];
  return sum;
}

/**
 * Count how many of the 4 suits have a card selected.
 */
function getSuitCount(selections?: CardSelections): number {
  if (!selections) return 0;
  let count = 0;
  if (selections.coins) count++;
  if (selections.cups) count++;
  if (selections.swords) count++;
  if (selections.clubs) count++;
  return count;
}

export default function PrimieraCalculator({
  players: playersProp,
  mode = "page",
  onApplyWinner,
  onClose,
}: PrimieraCalculatorProps) {
  const isModal = mode === "modal";

  // Standalone mode: player count configuration (2-4 players)
  const [standalonePlayerCount, setStandalonePlayerCount] = useState<number>(2);
  const [isPlayerCountExpanded, setIsPlayerCountExpanded] =
    useState<boolean>(true);

  // Standalone mode default players list
  const standalonePlayers: Player[] = useMemo(() => {
    const list: Player[] = [];
    for (let i = 1; i <= standalonePlayerCount; i++) {
      list.push({
        id: `p${i}`,
        name: `Player ${i}`,
      });
    }
    return list;
  }, [standalonePlayerCount]);

  // Active player list to use
  const activePlayers = playersProp || standalonePlayers;

  // Selected player tab
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    activePlayers[0]?.id || "p1",
  );

  // Effective selected player ID (safely fallback if selectedPlayerId is no longer in list)
  const effectiveSelectedPlayerId = activePlayers.some(
    (p) => p.id === selectedPlayerId,
  )
    ? selectedPlayerId
    : activePlayers[0]?.id || "p1";

  // Store card selections per player ID
  const [allSelections, setAllSelections] = useState<
    Record<string, CardSelections>
  >(() => {
    const initial: Record<string, CardSelections> = {};
    for (const p of activePlayers) {
      initial[p.id] = { ...EMPTY_SELECTIONS };
    }
    return initial;
  });

  const [activeSuit, setActiveSuit] = useState<Suits | null>(null);

  // Scores for all players
  const playerScores: Record<string, number> = {};
  const playerRunningScores: Record<string, number> = {};
  const playerSuitCounts: Record<string, number> = {};

  for (const p of activePlayers) {
    const sel = allSelections[p.id] || EMPTY_SELECTIONS;
    playerScores[p.id] = calculatePrimieraScore(sel);
    playerRunningScores[p.id] = getRunningScore(sel);
    playerSuitCounts[p.id] = getSuitCount(sel);
  }

  // All active players have completed 4 suits
  const allCalculated =
    activePlayers.length > 0 &&
    activePlayers.every((p) => playerSuitCounts[p.id] === 4);

  // Winner determination
  let winnerId: string | null = null;
  let isTie = false;

  if (allCalculated && activePlayers.length > 1) {
    const sorted = [...activePlayers].sort(
      (a, b) => playerScores[b.id] - playerScores[a.id],
    );
    if (
      sorted.length > 1 &&
      playerScores[sorted[0].id] === playerScores[sorted[1].id]
    ) {
      isTie = true;
      winnerId = null;
    } else if (sorted.length > 0) {
      winnerId = sorted[0].id;
    }
  }

  const currentSelections =
    allSelections[effectiveSelectedPlayerId] || EMPTY_SELECTIONS;

  const handleCardSelect = (suit: Suits, value: CardValue) => {
    setAllSelections((prev) => ({
      ...prev,
      [effectiveSelectedPlayerId]: {
        ...(prev[effectiveSelectedPlayerId] || EMPTY_SELECTIONS),
        [suit]: value,
      },
    }));
    setActiveSuit(null);
    setIsPlayerCountExpanded(false);
  };

  const handleRemoveCard = (suit: Suits) => {
    setAllSelections((prev) => ({
      ...prev,
      [effectiveSelectedPlayerId]: {
        ...(prev[effectiveSelectedPlayerId] || EMPTY_SELECTIONS),
        [suit]: null,
      },
    }));
  };

  const handleResetAllCards = () => {
    setAllSelections({});
  };

  // Map of cards taken by other players in the currently active suit
  const takenCardsInActiveSuit = useMemo(() => {
    if (!activeSuit) return {};
    const map: Partial<Record<CardValue, string>> = {};
    for (const p of activePlayers) {
      if (p.id !== effectiveSelectedPlayerId) {
        const val = allSelections[p.id]?.[activeSuit];
        if (val) {
          map[val] = p.name;
        }
      }
    }
    return map;
  }, [activeSuit, activePlayers, effectiveSelectedPlayerId, allSelections]);

  const handleStandalonePlayerCountChange = (count: number) => {
    setStandalonePlayerCount(count);
    setSelectedPlayerId("p1");
    setIsPlayerCountExpanded(false);
  };

  const navigate = useNavigate();

  const handleTransferToScorecard = () => {
    const newGame: GameState = {
      id: `game_${Date.now()}`,
      createdAt: Date.now(),
      players: activePlayers,
      settings: {
        playerCount: activePlayers.length,
        targetScore: 11,
        isTeams: false,
      },
      rounds: [],
      isFinished: false,
      winnerId: null,
    };
    saveGameState(newGame);

    const primieraResult = isTie ? "tie" : winnerId || "tie";
    navigate(`/score?round=1&primiera=${primieraResult}`, {
      state: {
        autoOpenRound1: true,
        initialPrimieraChoice: primieraResult,
      },
    });
  };

  const handleApply = () => {
    if (onApplyWinner) {
      onApplyWinner(winnerId, playerScores);
    }
  };

  return (
    <div
      className={`flex flex-col w-full ${
        isModal
          ? "max-w-2xl mx-auto rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl overflow-hidden text-white"
          : "flex-1 flex flex-col w-full max-w-3xl mx-auto text-white min-h-0 bg-transparent"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between shrink-0 ${
          isModal
            ? "border-b border-emerald-800 bg-emerald-950/70 px-4 py-3 sm:px-6"
            : "px-4 pt-3 pb-2 sm:px-6 bg-transparent"
        }`}
      >
        <div>
          <h2
            id="primiera-calculator-title"
            className="text-xl sm:text-2xl font-bold text-white leading-tight"
          >
            Primiera Calculator
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200 mt-0.5">
            {isModal
              ? "Calculate Primiera point for this round"
              : "Select the highest card in each suit"}
          </p>
        </div>

        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close calculator"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-emerald-300 hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            ✕
          </button>
        )}

        {!isModal && (
          <button
            type="button"
            onClick={handleResetAllCards}
            className="min-h-[44px] text-xs sm:text-sm rounded-xl bg-emerald-700 hover:bg-emerald-600 text-yellow-300 hover:text-white px-4 py-2 font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            Reset
          </button>
        )}
      </div>

      {/* Standalone Player Count Selector (Page Mode only) */}
      {!isModal &&
        !playersProp &&
        !allCalculated &&
        (isPlayerCountExpanded ? (
          <div className="w-full px-4 py-2 bg-transparent shrink-0">
            <div className="grid grid-cols-3 w-full gap-2">
              {[2, 3, 4].map((count) => {
                const isActive = standalonePlayerCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleStandalonePlayerCountChange(count)}
                    className={`min-h-[44px] py-2 px-2 rounded-xl text-sm sm:text-base font-bold transition-all text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                      isActive
                        ? "bg-yellow-400 text-emerald-950 shadow-md"
                        : "bg-emerald-800/80 text-emerald-200 hover:bg-emerald-700 hover:text-white"
                    }`}
                  >
                    {count} Players
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 py-1.5 text-xs sm:text-sm bg-transparent shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold uppercase tracking-wider text-xs">
                Players:
              </span>
              <span className="text-white font-bold bg-emerald-700 px-2.5 py-1 rounded-lg text-xs sm:text-sm">
                {standalonePlayerCount} Players
              </span>
            </div>
            <button
              type="button"
              aria-expanded={false}
              onClick={() => setIsPlayerCountExpanded(true)}
              className="min-h-[44px] text-yellow-300 hover:text-yellow-200 font-bold flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-lg px-2"
            >
              <span>Change</span>
              <span className="text-xs" aria-hidden="true">
                ▾
              </span>
            </button>
          </div>
        ))}

      {/* Winner Announcement Banner (Rendered above the Player Selector Cards) */}
      {allCalculated && (
        <div
          role="status"
          aria-live="polite"
          className="mx-3 sm:mx-4 mt-2 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border border-yellow-400/60 shadow-lg text-center shrink-0"
        >
          {/* Winner Announcement */}
          <div className="flex items-center justify-center gap-2 text-base sm:text-lg font-bold text-yellow-300">
            {winnerId ? (
              <div>
                {activePlayers.find((p) => p.id === winnerId)?.name} wins the
                Primiera point!
              </div>
            ) : isTie ? (
              <>
                <span className="text-xl" aria-hidden="true">
                  ⚖️
                </span>
                <span className="text-amber-200">
                  Tie! No Primiera point awarded.
                </span>
              </>
            ) : null}
          </div>

          {/* Score summary chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            {activePlayers.map((p) => (
              <span
                key={p.id}
                className={`text-xs sm:text-sm px-2.5 py-0.5 rounded-lg font-bold ${
                  winnerId === p.id
                    ? "bg-yellow-400 text-emerald-950 shadow-sm"
                    : "bg-emerald-950/80 border border-emerald-700/60 text-emerald-200"
                }`}
              >
                {p.name}: {playerScores[p.id]} pts
              </span>
            ))}
          </div>

          {/* Action buttons (Page Mode only) */}
          {!isModal && (
            <div className="grid grid-cols-2 gap-2.5 mt-2.5 pt-2.5 border-t border-yellow-400/25 w-full">
              <button
                type="button"
                onClick={handleResetAllCards}
                className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold text-sm transition-colors cursor-pointer text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              >
                Reset Hand
              </button>
              <button
                type="button"
                onClick={handleTransferToScorecard}
                className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-bold text-sm transition-colors cursor-pointer text-center shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Start Game with Result →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Player Selector Comparison Cards */}
      {activePlayers.length > 1 && (
        <div
          role="tablist"
          aria-label="Players primiera selection"
          className={`grid w-full gap-2 shrink-0 ${
            isModal
              ? "border-b border-emerald-800 bg-emerald-950/40 p-2"
              : "px-3 sm:px-4 py-2 bg-transparent"
          } ${
            activePlayers.length === 2
              ? "grid-cols-2"
              : activePlayers.length === 3
                ? "grid-cols-3"
                : "grid-cols-4"
          }`}
        >
          {activePlayers.map((p) => {
            const score = playerRunningScores[p.id] || 0;
            const suitsCount = playerSuitCounts[p.id] || 0;
            const isSelected = p.id === effectiveSelectedPlayerId;
            const isLeader =
              winnerId === p.id ||
              (allCalculated &&
                score === Math.max(...Object.values(playerScores)));

            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedPlayerId(p.id)}
                className={`w-full min-w-0 min-h-[44px] flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                  isSelected
                    ? "bg-emerald-700 border-yellow-400 ring-2 ring-yellow-400/80 shadow-lg"
                    : isLeader && score > 0
                      ? "bg-emerald-800/80 border-yellow-400/70 hover:bg-emerald-800"
                      : "bg-emerald-900/60 border-emerald-700/60 hover:bg-emerald-800/60"
                }`}
              >
                <div className="flex items-center gap-1 text-xs sm:text-sm font-bold truncate max-w-full text-emerald-100">
                  {allCalculated && winnerId === p.id && (
                    <span className="text-yellow-300" aria-hidden="true">
                      ⭐
                    </span>
                  )}
                  <span className="truncate">{p.name}</span>
                </div>

                <div className="text-xl sm:text-2xl font-extrabold text-white leading-tight mt-0.5">
                  {suitsCount === 4
                    ? `${score} pts`
                    : suitsCount > 0
                      ? `${score}`
                      : "—"}
                </div>

                <div className="text-xs sm:text-sm font-semibold h-4 flex items-center justify-center">
                  {allCalculated && winnerId === p.id ? (
                    <span className="text-yellow-300 font-bold">Winner</span>
                  ) : isLeader && score > 0 ? (
                    <span className="text-yellow-300/90 font-bold">
                      Highest
                    </span>
                  ) : suitsCount < 4 && suitsCount > 0 ? (
                    <span className="text-emerald-300">
                      {suitsCount}/4 suits
                    </span>
                  ) : (
                    <span className="text-emerald-400/80">
                      {isSelected ? "Active" : "Tap to edit"}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-3">
        {/* 4 Card Suit Slots */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SUITS.map((suit) => {
            const selectedValue = currentSelections[suit];
            const suitInfo = CARD_DATA[suit];
            return (
              <button
                key={suit}
                type="button"
                onClick={() => setActiveSuit(suit)}
                aria-label={
                  selectedValue
                    ? `${selectedValue} of ${suit}, ${primieraValues[selectedValue]} points. Tap to change.`
                    : `Select highest card for ${suitInfo.displayName}`
                }
                className={`group relative flex aspect-[2/3] flex-col items-center justify-center rounded-2xl p-2 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 cursor-pointer ${
                  selectedValue
                    ? "bg-white ring-2 ring-yellow-400 hover:ring-yellow-300"
                    : "bg-emerald-800/80 border-2 border-dashed border-emerald-600 hover:border-emerald-400 hover:bg-emerald-700/70"
                }`}
              >
                {selectedValue ? (
                  <div className="relative flex h-full w-full flex-col items-center justify-between">
                    {/* Inline X button to clear this card */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCard(suit);
                      }}
                      className="absolute -top-3 -right-3 z-10 size-8 sm:size-9 rounded-full bg-emerald-950 hover:bg-red-600 text-white text-sm font-bold flex items-center justify-center shadow-lg border border-emerald-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      title={`Clear ${suit}`}
                      aria-label={`Clear ${suit}`}
                    >
                      ✕
                    </button>
                    <div className="min-h-0 w-full flex-1 flex items-center justify-center p-1">
                      <img
                        src={getCardImage(suit, selectedValue)}
                        alt={`${selectedValue} of ${suit}`}
                        className="h-full w-full object-contain drop-shadow-sm"
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between w-full px-2.5 py-1 text-xs sm:text-sm font-bold bg-emerald-950 text-emerald-100 border border-emerald-800/80 rounded-lg shadow-xs">
                      <span className="capitalize">{suit}</span>
                      <span className="text-yellow-300 font-bold">
                        {primieraValues[selectedValue]} pts
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-2 text-center h-full w-full">
                    <img
                      src={suitInfo.icon}
                      alt=""
                      aria-hidden="true"
                      className="size-32 sm:size-40 object-contain transition-transform duration-200 group-hover:scale-110 drop-shadow-md"
                    />
                    <span className="text-base sm:text-lg font-bold text-white tracking-wide">
                      {suitInfo.displayName}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-emerald-300">
                      Tap to choose
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Actions (Modal Mode) */}
      {isModal && (
        <div className="border-t border-emerald-800 bg-emerald-950/70 px-4 py-3 sm:px-6 shrink-0">
          <button
            type="button"
            onClick={handleApply}
            disabled={!allCalculated}
            className={`w-full min-h-[48px] rounded-xl py-3 font-bold shadow-lg transition-all text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
              allCalculated
                ? "bg-yellow-400 text-emerald-950 hover:bg-yellow-300 hover:scale-[1.01] cursor-pointer"
                : "bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed"
            }`}
          >
            Apply to Round
          </button>
        </div>
      )}

      {/* Card Selector Modal */}
      {activeSuit && (
        <CardSelector
          activeSuit={activeSuit}
          onClose={() => setActiveSuit(null)}
          onCardSelect={handleCardSelect}
          takenCards={takenCardsInActiveSuit}
          currentSelection={currentSelections[activeSuit]}
        />
      )}
    </div>
  );
}
