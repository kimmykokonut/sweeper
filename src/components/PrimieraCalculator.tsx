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
        className={`flex items-center justify-between ${
          isModal
            ? "border-b border-emerald-800 bg-emerald-950/70 px-4 py-3 sm:px-6"
            : "px-4 pt-3 pb-2 sm:px-6 bg-transparent"
        }`}
      >
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
            Primiera Calculator
          </h2>
          <p className="text-xs text-emerald-300">
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
            className="rounded-lg p-1.5 text-emerald-300 hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        )}

        {!isModal && (
          <button
            type="button"
            onClick={handleResetAllCards}
            className="text-xs rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-200 hover:text-white px-2.5 py-1.5 font-medium transition-colors cursor-pointer"
          >
            Reset Hand
          </button>
        )}
      </div>

      {/* Standalone Player Count Selector (Page Mode only) */}
      {!isModal &&
        !playersProp &&
        !allCalculated &&
        (isPlayerCountExpanded ? (
          <div className="w-full px-4 py-2 bg-transparent">
            <div className="grid grid-cols-3 w-full gap-2">
              {[2, 3, 4].map((count) => {
                const isActive = standalonePlayerCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handleStandalonePlayerCountChange(count)}
                    className={`py-2 px-1 rounded-lg text-xs sm:text-sm font-bold transition-all text-center cursor-pointer ${
                      isActive
                        ? "bg-yellow-400 text-emerald-950 shadow"
                        : "bg-emerald-800/80 text-emerald-200 hover:bg-emerald-700"
                    }`}
                  >
                    {count} Players
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 py-1.5 text-xs bg-transparent">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[11px]">
                Players:
              </span>
              <span className="text-white font-bold bg-emerald-800/90 px-2 py-0.5 rounded text-xs">
                {standalonePlayerCount} Players
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsPlayerCountExpanded(true)}
              className="text-yellow-300 hover:text-yellow-200 font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <span>Change</span>
              <span className="text-[10px]">▾</span>
            </button>
          </div>
        ))}

      {/* Player Selector Comparison Cards */}
      {activePlayers.length > 1 && (!allCalculated || isModal) && (
        <div
          className={`grid w-full gap-2 ${
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
                onClick={() => setSelectedPlayerId(p.id)}
                className={`w-full min-w-0 flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center cursor-pointer ${
                  isSelected
                    ? "bg-emerald-700 border-yellow-400 ring-2 ring-yellow-400/80 shadow-lg"
                    : isLeader && score > 0
                      ? "bg-emerald-800/80 border-yellow-400/70 hover:bg-emerald-800"
                      : "bg-emerald-900/60 border-emerald-700/60 hover:bg-emerald-800/60"
                }`}
              >
                <div className="flex items-center gap-1 text-xs font-semibold truncate max-w-full text-emerald-100">
                  {allCalculated && winnerId === p.id && (
                    <span className="text-yellow-300">⭐</span>
                  )}
                  <span className="truncate">{p.name}</span>
                </div>

                <div className="text-lg sm:text-xl font-extrabold text-white leading-tight mt-0.5">
                  {suitsCount === 4
                    ? `${score} pts`
                    : suitsCount > 0
                      ? `${score}`
                      : "—"}
                </div>

                <div className="text-[10px] sm:text-[11px] font-bold h-4 flex items-center justify-center">
                  {allCalculated && winnerId === p.id ? (
                    <span className="text-yellow-300">Winner</span>
                  ) : isLeader && score > 0 ? (
                    <span className="text-yellow-300/90">👑 Highest</span>
                  ) : suitsCount < 4 && suitsCount > 0 ? (
                    <span className="text-emerald-400">
                      {suitsCount}/4 suits
                    </span>
                  ) : (
                    <span className="text-emerald-500/70">
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
        {/* Celebration / Action Card (Shown when all cards are selected) */}
        {allCalculated && (
          <div className="rounded-2xl bg-gradient-to-b from-yellow-400/20 via-emerald-900/60 to-emerald-950/80 border border-yellow-400/50 p-3 sm:p-4 text-center shadow-lg">
            {/* Winner Announcement */}
            <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-extrabold text-yellow-300 mb-1">
              {winnerId ? (
                <>
                  <span className="text-lg">⭐</span>
                  <span>
                    {activePlayers.find((p) => p.id === winnerId)?.name} wins
                    the Primiera point!
                  </span>
                </>
              ) : isTie ? (
                <>
                  <span className="text-lg">⚖️</span>
                  <span className="text-amber-200">
                    Tie! No Primiera point awarded.
                  </span>
                </>
              ) : null}
            </div>

            {/* Score summary chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 my-2">
              {activePlayers.map((p) => (
                <span
                  key={p.id}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                    winnerId === p.id
                      ? "bg-yellow-400 text-emerald-950 shadow"
                      : "bg-emerald-950/70 border border-emerald-700/60 text-emerald-200"
                  }`}
                >
                  {p.name}: {playerScores[p.id]} pts
                </span>
              ))}
            </div>

            {/* Action buttons (Page Mode only) */}
            {!isModal && (
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-yellow-400/30 w-full">
                <button
                  type="button"
                  onClick={handleResetAllCards}
                  className="w-full py-2 px-2 sm:px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center"
                >
                  Reset Hand
                </button>
                <button
                  type="button"
                  onClick={handleTransferToScorecard}
                  className="w-full py-2 px-2 sm:px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center"
                >
                  Transfer to Scorecard
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4 Card Suit Slots */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SUITS.map((suit) => {
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
                  <div className="relative flex h-full w-full flex-col items-center justify-center">
                    {/* Inline X button to clear this card */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCard(suit);
                      }}
                      className="absolute -top-1 -right-1 z-10 size-5 rounded-full bg-emerald-950/90 hover:bg-red-600 text-white text-[11px] font-bold flex items-center justify-center shadow-md transition-colors cursor-pointer"
                      title={`Clear ${suit}`}
                      aria-label={`Clear ${suit}`}
                    >
                      ✕
                    </button>
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
      </div>

      {/* Footer Actions (Modal Mode) */}
      {isModal && (
        <div className="border-t border-emerald-800 bg-emerald-950/70 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={handleApply}
            disabled={!allCalculated}
            className={`w-full rounded-xl py-2.5 font-bold shadow-lg transition-all text-sm ${
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
