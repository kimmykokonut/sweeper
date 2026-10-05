import { useState, useEffect } from "react";
import type { Player, RoundEntry, RoundRawCounts } from "../types";
import coinIcon from "../assets/denare.png";
import PrimieraModal from "./PrimieraModal";
import {
  calculateAutoFillCards,
} from "../utils/scorecardHelpers";
import { getCardImage, useDeckStyle } from "../utils/cardData";

interface RoundScoreModalProps {
  players: Player[];
  roundNumber: number;
  existingRound?: RoundEntry | null;
  initialPrimieraChoice?: string | "tie" | null;
  onSave: (round: Omit<RoundEntry, "cumulativeTotals">) => void;
  onClose: () => void;
}

export default function RoundScoreModal({
  players,
  roundNumber,
  existingRound,
  initialPrimieraChoice,
  onSave,
  onClose,
}: RoundScoreModalProps) {
  const [deckStyle] = useDeckStyle();
  const setteBelloImg = getCardImage("coins", "seven", deckStyle);
  const oneSpadesImg = getCardImage("swords", "ace", deckStyle);

  // State for Scope sweeps
  const [scope, setScope] = useState<Record<string, number>>(() => {
    if (existingRound) return { ...existingRound.scope };
    const initial: Record<string, number> = {};
    for (const p of players) initial[p.id] = 0;
    return initial;
  });

  // Category choices: player ID | "tie" | null (unselected)
  const [carteChoice, setCarteChoice] = useState<string | "tie" | null>(() => {
    if (!existingRound) return null;
    return existingRound.carteWinnerId ?? "tie";
  });

  const [denariChoice, setDenariChoice] = useState<string | "tie" | null>(
    () => {
      if (!existingRound) return null;
      return existingRound.denariWinnerId ?? "tie";
    },
  );

  const [settebelloWinnerId, setSettebelloWinnerId] = useState<string | null>(
    existingRound?.settebelloWinnerId ?? null,
  );

  const [primieraChoice, setPrimieraChoice] = useState<string | "tie" | null>(
    () => {
      if (existingRound) return existingRound.primieraWinnerId ?? "tie";
      if (
        initialPrimieraChoice !== undefined &&
        initialPrimieraChoice !== null
      ) {
        return initialPrimieraChoice;
      }
      return null;
    },
  );

  // Primiera modal visibility
  const [showPrimieraCalc, setShowPrimieraCalc] = useState(false);
  const [primieraMethod, setPrimieraMethod] = useState<string | null>(() => {
    if (existingRound?.primieraWinnerId) return "manual";
    if (initialPrimieraChoice) return "calculated";
    return null;
  });

  // Optional Count Helper mode
  const [showCountHelper, setShowCountHelper] = useState(false);

  // Close on Escape key press (only if nested Primiera calc is not open)
  useEffect(() => {
    if (showPrimieraCalc) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPrimieraCalc, onClose]);
  const [rawCounts, setRawCounts] = useState<Record<string, RoundRawCounts>>(
    () => {
      if (existingRound?.rawCounts) return { ...existingRound.rawCounts };
      const initial: Record<string, RoundRawCounts> = {};
      for (const p of players) initial[p.id] = { cards: undefined };
      return initial;
    },
  );

  const [autoFilledCardsPlayerId, setAutoFilledCardsPlayerId] = useState<
    string | null
  >(null);

  // Round completion check: all 4 main categories must have a choice
  const isRoundComplete = Boolean(
    carteChoice && denariChoice && settebelloWinnerId && primieraChoice,
  );

  // Scope counters handler
  const handleScopeChange = (playerId: string, delta: number) => {
    setScope((prev) => {
      const current = prev[playerId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [playerId]: next };
    });
  };

  const handleCardCountChange = (playerId: string, val: string) => {
    const playerIds = players.map((p) => p.id);
    const existingCounts: Record<string, number | undefined> = {};
    for (const p of players) {
      existingCounts[p.id] = rawCounts[p.id]?.cards;
    }

    const result = calculateAutoFillCards(
      existingCounts,
      playerId,
      val,
      playerIds,
      autoFilledCardsPlayerId,
    );

    const updatedRawCounts: Record<string, RoundRawCounts> = { ...rawCounts };
    for (const id of playerIds) {
      updatedRawCounts[id] = {
        ...updatedRawCounts[id],
        cards: result.updatedCounts[id],
      };
    }

    setRawCounts(updatedRawCounts);
    setAutoFilledCardsPlayerId(result.autoFilledId);
    setCarteChoice(result.carteWinnerId);
  };

  // Calculate live preview totals
  const roundTotals: Record<string, number> = {};
  for (const p of players) {
    let pts = scope[p.id] || 0;
    if (carteChoice === p.id) pts += 1;
    if (denariChoice === p.id) pts += 1;
    if (settebelloWinnerId === p.id) pts += 1;
    if (primieraChoice === p.id) pts += 1;
    roundTotals[p.id] = pts;
  }

  const handleSave = () => {
    if (!isRoundComplete) return;

    onSave({
      roundNumber,
      scope,
      carteWinnerId: carteChoice === "tie" ? null : carteChoice,
      denariWinnerId: denariChoice === "tie" ? null : denariChoice,
      settebelloWinnerId,
      primieraWinnerId: primieraChoice === "tie" ? null : primieraChoice,
      roundTotals,
      rawCounts: showCountHelper ? rawCounts : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-2 sm:p-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xs cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="round-score-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative flex max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl text-white overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-emerald-800 bg-emerald-950/80 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              📝
            </span>
            <h2
              id="round-score-modal-title"
              className="text-xl sm:text-2xl font-bold text-white"
            >
              {existingRound
                ? `Edit Round ${roundNumber}`
                : `Score Round ${roundNumber}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close round scoring dialog"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800/70 transition-colors cursor-pointer text-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          {/* Section 1: Scope (Sweeps) */}
          <div className="rounded-xl bg-emerald-950/60 border border-emerald-800 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">
                  🧹
                </span>
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg">
                    Scope (Sweeps)
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-200">
                    1 point per scopa
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`grid gap-2 sm:gap-2.5 ${
                players.length === 3
                  ? "grid-cols-2 sm:grid-cols-3"
                  : "grid-cols-2"
              }`}
            >
              {players.map((p, index) => {
                const isThirdInThree = players.length === 3 && index === 2;
                return (
                  <div
                    key={p.id}
                    className={`flex flex-col items-center justify-between bg-emerald-900/80 border border-emerald-700 rounded-lg p-1.5 sm:p-3 ${
                      isThirdInThree
                        ? "col-span-2 sm:col-span-1 max-w-[calc(50%-0.25rem)] sm:max-w-none mx-auto sm:mx-0 w-full"
                        : ""
                    }`}
                  >
                    <span
                      className="font-semibold text-sm sm:text-base text-white truncate max-w-full mb-2 text-center"
                      title={p.name}
                    >
                      {p.name}
                    </span>
                    <div className="flex items-center sm:gap-1">
                      <button
                        type="button"
                        onClick={() => handleScopeChange(p.id, -1)}
                        aria-label={`Decrease ${p.name}'s sweeps`}
                        className="min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] bg-emerald-800 rounded-full text-lg sm:text-xl font-bold text-white hover:bg-emerald-700 active:scale-95 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none cursor-pointer transition-colors"
                      >
                        -
                      </button>
                      <span
                        aria-label={`${p.name}: ${scope[p.id] || 0} sweeps`}
                        className="w-7 sm:w-10 text-center font-bold text-lg sm:text-xl text-yellow-300"
                      >
                        {scope[p.id] || 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleScopeChange(p.id, 1)}
                        aria-label={`Increase ${p.name}'s sweeps`}
                        className="min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] rounded-full bg-emerald-700 text-lg sm:text-xl font-bold text-white hover:bg-emerald-600 active:scale-95 flex items-center justify-center shadow-xs focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Carte (Cards) */}
          <div className="rounded-xl bg-emerald-950/60 border border-emerald-800 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={oneSpadesImg}
                  alt=""
                  aria-hidden="true"
                  className="h-8 w-auto rounded border border-yellow-400 shrink-0"
                />

                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg">
                    <span>Carte</span>{" "}
                    <span className="inline-block whitespace-nowrap">
                      (Most Cards)
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-200">1 point</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCountHelper(!showCountHelper)}
                aria-expanded={showCountHelper}
                className="text-xs sm:text-sm font-semibold text-yellow-300 hover:text-white hover:bg-emerald-800/80 flex items-center gap-1.5 bg-emerald-900/90 border border-emerald-600/80 px-2.5 py-1.5 min-h-[36px] rounded-lg focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors cursor-pointer"
              >
                <span>{showCountHelper ? "Hide Counts" : "Enter Count"}</span>
                <span
                  className="text-[10px] text-emerald-400"
                  aria-hidden="true"
                >
                  {showCountHelper ? "▲" : "▼"}
                </span>
              </button>
            </div>

            {/* Optional count inputs */}
            {showCountHelper && (
              <div className="mb-3 p-3 rounded-lg bg-emerald-900/90 border border-emerald-700 text-xs sm:text-sm space-y-2.5">
                <div className="flex justify-between items-center text-xs sm:text-sm text-emerald-200 font-medium">
                  Enter cards captured (of 40):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {players.map((p) => {
                    const isAutoFilled = autoFilledCardsPlayerId === p.id;
                    const otherCards = players
                      .filter(
                        (other) =>
                          other.id !== p.id &&
                          other.id !== autoFilledCardsPlayerId,
                      )
                      .reduce(
                        (sum, other) => sum + (rawCounts[other.id]?.cards || 0),
                        0,
                      );
                    const maxPlayerCards = Math.max(0, 40 - otherCards);

                    return (
                      <div key={p.id} className="flex flex-col">
                        <label
                          htmlFor={`cards-count-${p.id}`}
                          className="flex items-center justify-between text-xs text-emerald-200 font-semibold mb-1"
                        >
                          <span className="truncate">{p.name}</span>
                          {isAutoFilled && (
                            <span className="text-[10px] text-yellow-300 font-bold bg-emerald-950/80 px-1 py-0.5 rounded border border-yellow-400/50">
                              Auto
                            </span>
                          )}
                        </label>
                        <input
                          id={`cards-count-${p.id}`}
                          type="number"
                          min="0"
                          max={maxPlayerCards}
                          value={rawCounts[p.id]?.cards ?? ""}
                          onChange={(e) =>
                            handleCardCountChange(p.id, e.target.value)
                          }
                          placeholder="0"
                          aria-label={`${p.name}'s captured cards count`}
                          className={`w-full rounded-lg border px-2 py-1.5 text-center font-bold text-base min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                            isAutoFilled
                              ? "bg-emerald-950/90 border-yellow-400/70 text-yellow-300"
                              : "bg-emerald-950 border-emerald-600 text-yellow-300"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {players.map((p) => {
                const isSelected = carteChoice === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCarteChoice(p.id)}
                    aria-pressed={isSelected}
                    className={`flex-1 min-w-[90px] min-h-[44px] py-2 px-3 rounded-lg text-sm sm:text-base font-semibold transition-all border cursor-pointer focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-400 shadow-md font-bold ring-2 ring-yellow-400"
                        : "bg-emerald-900/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setCarteChoice("tie")}
                aria-pressed={carteChoice === "tie"}
                className={`flex-1 min-w-[90px] min-h-[44px] py-2 px-3 rounded-lg text-sm sm:text-base font-semibold transition-all border cursor-pointer focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none ${
                  carteChoice === "tie"
                    ? "bg-emerald-600 text-white border-emerald-400 shadow-md font-bold ring-2 ring-yellow-400"
                    : "bg-emerald-900/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800"
                }`}
              >
                Tie (0 pts)
              </button>
            </div>
          </div>

          {/* Section 3: Denari (Coins) */}
          <div className="rounded-xl bg-emerald-950/60 border border-emerald-800 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={coinIcon}
                  alt=""
                  aria-hidden="true"
                  className="h-7 w-auto rounded border border-yellow-300 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg">
                    Denari (Most Coins)
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-200">
                    1 point for most coins (of 10)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {players.map((p) => {
                const isSelected = denariChoice === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setDenariChoice(p.id)}
                    aria-pressed={isSelected}
                    className={`flex-1 min-w-[90px] min-h-[44px] py-2 px-3 rounded-lg text-sm sm:text-base font-semibold transition-all border cursor-pointer focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-400 shadow-md font-bold ring-2 ring-yellow-400"
                        : "bg-emerald-900/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setDenariChoice("tie")}
                aria-pressed={denariChoice === "tie"}
                className={`flex-1 min-w-[90px] min-h-[44px] py-2 px-3 rounded-lg text-sm sm:text-base font-semibold transition-all border cursor-pointer focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none ${
                  denariChoice === "tie"
                    ? "bg-emerald-600 text-white border-emerald-400 shadow-md font-bold ring-2 ring-yellow-400"
                    : "bg-emerald-900/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800"
                }`}
              >
                Tie (0 pts)
              </button>
            </div>
          </div>

          {/* Section 2: Settebello */}
          <div className="rounded-xl bg-emerald-950/60 border border-emerald-800 p-2 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={setteBelloImg}
                  alt=""
                  aria-hidden="true"
                  className="h-8 w-auto rounded border border-yellow-400 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg">
                    Il Settebello (7 of Coins)
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-200">1 point</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {players.map((p) => {
                const isSelected = settebelloWinnerId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSettebelloWinnerId(p.id)}
                    aria-pressed={isSelected}
                    className={`flex-1 min-w-[90px] min-h-[44px] py-2 px-2.5 sm:px-3 rounded-lg text-sm sm:text-base font-semibold transition-all border flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-400 shadow-md font-bold ring-2 ring-yellow-400"
                        : "bg-emerald-900/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800"
                    }`}
                  >
                    {isSelected && (
                      <img
                        src={coinIcon}
                        alt=""
                        aria-hidden="true"
                        className="size-4 sm:size-5 object-contain inline-block shrink-0"
                      />
                    )}
                    <span className="truncate">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Primiera */}
          <div className="rounded-xl bg-emerald-950/60 border border-emerald-800 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-1.5">
                  <span aria-hidden="true">🏆</span>
                  <span>Primiera</span>
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200">
                  1 pt for highest 4-suit primiera total.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPrimieraCalc(true)}
                className="flex items-center gap-1.5 bg-yellow-400 text-emerald-950 font-bold px-3.5 py-1.5 min-h-[38px] rounded-lg text-xs sm:text-sm hover:bg-yellow-300 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none transition-all active:scale-95 shadow-md cursor-pointer"
              >
                <span>Open Calculator</span>
              </button>
            </div>

            {primieraMethod === "calculated" && (
              <div className="mb-2 text-xs sm:text-sm text-yellow-300 font-medium flex items-center gap-1">
                <span>✓ Winner determined via Primiera Calculator</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {players.map((p) => {
                const isSelected = primieraChoice === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPrimieraChoice(p.id);
                      setPrimieraMethod("manual");
                    }}
                    aria-pressed={isSelected}
                    className={`flex-1 min-w-[90px] min-h-[44px] py-2 px-3 rounded-lg text-sm sm:text-base font-semibold transition-all border cursor-pointer focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-400 shadow-md font-bold ring-2 ring-yellow-400"
                        : "bg-emerald-900/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setPrimieraChoice("tie");
                  setPrimieraMethod("manual");
                }}
                aria-pressed={primieraChoice === "tie"}
                className={`flex-1 min-w-[90px] min-h-[44px] py-2 px-3 rounded-lg text-sm sm:text-base font-semibold transition-all border cursor-pointer focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none ${
                  primieraChoice === "tie"
                    ? "bg-emerald-600 text-white border-emerald-400 shadow-md font-bold ring-2 ring-yellow-400"
                    : "bg-emerald-900/80 text-emerald-100 border-emerald-700 hover:bg-emerald-800"
                }`}
              >
                Tie (0 pts)
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 border-t border-emerald-800 bg-emerald-950/95 px-3 py-2.5 sm:px-6 sm:py-3 space-y-2">
          {/* Pinned Round Points Summary */}
          <div
            className={`grid gap-1.5 sm:gap-2 ${
              players.length === 3
                ? "grid-cols-2 sm:grid-cols-3"
                : "grid-cols-2 sm:grid-cols-4"
            }`}
          >
            {players.map((p, index) => {
              const total = roundTotals[p.id] || 0;
              const isThirdInThree = players.length === 3 && index === 2;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-900/70 border border-emerald-700/80 text-xs sm:text-sm ${
                    isThirdInThree
                      ? "col-span-2 sm:col-span-1 max-w-[calc(50%-0.1875rem)] sm:max-w-none mx-auto sm:mx-0 w-full"
                      : ""
                  }`}
                >
                  <span className="text-emerald-100 font-semibold truncate mr-2">
                    {p.name}
                  </span>
                  <span className="font-bold text-yellow-300 whitespace-nowrap shrink-0">
                    +{total} {total === 1 ? "pt" : "pts"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Save Button (only shown once all 4 categories are chosen) */}
          {isRoundComplete && (
            <button
              type="button"
              onClick={handleSave}
              className="w-full min-h-[44px] rounded-xl py-2.5 font-bold shadow-lg transition-all text-base sm:text-lg bg-yellow-400 text-emerald-950 hover:bg-yellow-300 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              {existingRound ? "Update Round" : "Save Round"}
            </button>
          )}
        </div>
      </div>

      {/* Embedded Primiera Modal */}
      {showPrimieraCalc && (
        <PrimieraModal
          players={players}
          onApplyWinner={(winner) => {
            setPrimieraChoice(winner ?? "tie");
            setPrimieraMethod("calculated");
            setShowPrimieraCalc(false);
          }}
          onClose={() => setShowPrimieraCalc(false)}
        />
      )}
    </div>
  );
}
