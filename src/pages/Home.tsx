import { useState, useEffect } from "react";
import { Link } from "react-router";
import type { GameState } from "../types";
import { loadGameState } from "../utils/scorecardHelpers";
import { getCardImage, useDeckStyle, DECK_OPTIONS } from "../utils/cardData";
import swordIcon from "../assets/spada.png";
import logo from "../assets/logo-192x192.png";

function Home() {
  const [activeGame] = useState<GameState | null>(() => loadGameState());
  const [deckStyle, setDeckStyle] = useDeckStyle();
  const [showDeckModal, setShowDeckModal] = useState(false);

  const assoDenari = getCardImage("coins", "ace", deckStyle);
  const setteBello = getCardImage("coins", "seven", deckStyle);
  const currentDeckOption =
    DECK_OPTIONS.find((d) => d.id === deckStyle) ?? DECK_OPTIONS[0];

  useEffect(() => {
    if (!showDeckModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowDeckModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDeckModal]);

  return (
    <div className="w-full flex-1 flex flex-col justify-between items-center px-4 py-3 sm:py-5 overflow-y-auto">
      {/* Top Brand & Developer Link Row */}
      <div className="w-full max-w-sm sm:max-w-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Sweeper logo"
            className="size-7 sm:size-8 object-contain drop-shadow-xs"
          />
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
            Sweeper
          </span>
        </div>
        <div className="flex items-center gap-1">
          <a
            href="https://github.com/kimmykokonut/sweeper"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            title="GitHub Repository"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-emerald-200/80 hover:text-yellow-300 hover:bg-emerald-950/60 focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors"
          >
            <svg
              className="size-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>
          <a
            href="https://kimmykokonut.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Developer portfolio"
            title="Developer Portfolio"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-emerald-200/80 hover:text-yellow-300 hover:bg-emerald-950/60 focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors"
          >
            <svg
              className="size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-sm sm:max-w-md my-auto flex flex-col items-center py-2">
        {/* Header / Branding */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Benvenuti!
          </h1>
          <p className="sm:text-lg text-emerald-200/90 max-w-xs sm:max-w-sm">
            Your Scopa companion for keeping score and calculating Primiera
            hands.
          </p>
        </div>

        {/* Active Game Quick-Resume Banner */}
        {activeGame && !activeGame.isFinished && (
          <Link
            to="/score"
            aria-label={`Resume game in progress, Round ${activeGame.rounds.length + 1}`}
            className="w-full flex items-center justify-between p-2 sm:p-3 rounded-xl bg-emerald-950/90 border border-emerald-700/80 text-emerald-100 hover:bg-emerald-900/90 hover:border-yellow-400/70 focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none transition-all shadow-md hover:scale-[1.01] active:scale-99 mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
              <div className="flex items-center justify-center size-8 sm:size-9 rounded-full bg-amber-50/95 border border-yellow-400 shadow-xs shrink-0 p-1">
                <img
                  src={swordIcon}
                  alt=""
                  aria-hidden="true"
                  className="size-full object-contain"
                />
              </div>
              <div className="min-w-0 flex flex-wrap items-baseline gap-x-1.5 leading-snug">
                <span className="text-base sm:text-lg font-semibold whitespace-nowrap">
                  Game in Progress
                </span>
                <span className="text-sm sm:text-base text-yellow-300 font-medium whitespace-nowrap">
                  (Round {activeGame.rounds.length + 1})
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-yellow-400 font-bold shrink-0 text-base sm:text-lg ml-1">
              Resume
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        )}

        {/* Main Links as Playing Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 w-full">
          {/* Card 1: Scorecard */}
          <Link
            to={
              activeGame && !activeGame.isFinished
                ? "/score?new=true"
                : "/score"
            }
            aria-label="Scorecard: Keep score for your Scopa game"
            className="group flex flex-col items-center cursor-pointer transition-all hover:-translate-y-1 active:scale-98 rounded-2xl focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none"
          >
            <img
              src={assoDenari}
              alt="Ace of coins - Scorecard"
              className="w-full aspect-[250/413] object-contain rounded-xl shadow-xl shadow-black/40 ring-1 ring-black/15 group-hover:ring-2 group-hover:ring-yellow-400/80 group-hover:shadow-2xl transition-all duration-200"
            />
            <div className="mt-1 sm:mt-1.5 w-full min-h-[48px] rounded-xl bg-yellow-400 group-hover:bg-yellow-300 text-emerald-950 py-1.5 px-2 sm:py-2 sm:px-2.5 text-center transition-all shadow-md flex flex-col items-center justify-center">
              <h2 className="text-base sm:text-lg font-extrabold leading-tight">
                Scorecard
              </h2>
              <span className="text-xs sm:text-sm font-semibold text-emerald-900/90 mt-0.5">
                {activeGame && !activeGame.isFinished
                  ? "New Game"
                  : "Start Game"}
              </span>
            </div>
          </Link>

          {/* Card 2: Primiera */}
          <Link
            to="/primiera"
            aria-label="Primiera: Calculate highest hand score"
            className="group flex flex-col items-center cursor-pointer transition-all hover:-translate-y-1 active:scale-98 rounded-2xl focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none"
          >
            <img
              src={setteBello}
              alt="Settebello card - Primiera calculator"
              className="w-full aspect-[250/413] object-contain rounded-xl shadow-xl shadow-black/40 ring-1 ring-black/15 group-hover:ring-2 group-hover:ring-yellow-400/80 group-hover:shadow-2xl transition-all duration-200"
            />
            <div className="mt-1 sm:mt-1.5 w-full min-h-[48px] rounded-xl bg-yellow-400 group-hover:bg-yellow-300 text-emerald-950 py-1.5 px-2 sm:py-2 sm:px-2.5 text-center transition-all shadow-md flex flex-col items-center justify-center">
              <h2 className="text-base sm:text-lg font-extrabold leading-tight">
                Primiera
              </h2>
              <span className="text-xs sm:text-sm font-semibold text-emerald-900/90 mt-0.5">
                Calculate Hand
              </span>
            </div>
          </Link>
        </div>

        {/* Deck Style Pill Trigger */}
        <div className="mt-4 sm:mt-5 flex justify-center w-full">
          <button
            type="button"
            onClick={() => setShowDeckModal(true)}
            aria-haspopup="dialog"
            aria-expanded={showDeckModal}
            aria-label={`Card deck: ${currentDeckOption.label}. Tap to change regional deck.`}
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-full bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-700/80 hover:border-yellow-400/80 text-emerald-100 text-sm sm:text-md font-semibold transition-all shadow-md active:scale-98 focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none cursor-pointer"
          >
            <span className="text-emerald-300/80 font-normal">Deck:</span>
            <span className="text-yellow-300 font-bold">
              {currentDeckOption.label}
            </span>
            <svg
              className="size-3.5 sm:size-4 text-emerald-300/80 transition-transform group-hover:translate-y-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Regional Deck Selector Modal */}
      {showDeckModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deck-modal-title"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-fade-in cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeckModal(false);
            }
          }}
        >
          <div
            className="relative flex w-full max-w-sm sm:max-w-md max-h-[calc(100dvh-2rem)] flex-col rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl text-white overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-emerald-800 bg-emerald-950/80 px-4 py-3 sm:px-5 sm:py-3.5">
              <div>
                <h3
                  id="deck-modal-title"
                  className="text-lg sm:text-xl font-bold text-white leading-tight"
                >
                  Card Deck Style
                </h3>
                <p className="text-xs text-emerald-300/80">
                  Select your preferred regional deck
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeckModal(false)}
                aria-label="Close deck selector"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800/70 transition-colors cursor-pointer text-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 shrink-0"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            {/* Modal Body: Deck Choices List */}
            <div
              role="radiogroup"
              aria-label="Regional Italian card decks"
              className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-1"
            >
              {DECK_OPTIONS.map((opt) => {
                const isSelected = deckStyle === opt.id;
                const previewCard = getCardImage("coins", "ace", opt.id);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      setDeckStyle(opt.id);
                      setShowDeckModal(false);
                    }}
                    className={`w-full min-h-[52px] p-2 sm:p-2.5 rounded-xl flex items-center justify-between gap-3 text-left transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none ${
                      isSelected
                        ? "bg-yellow-400/15 border-2 border-yellow-400 shadow-md ring-1 ring-yellow-400/30"
                        : "bg-emerald-950/70 border border-emerald-800/80 hover:bg-emerald-900/80 hover:border-emerald-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={previewCard}
                        alt=""
                        aria-hidden="true"
                        className="w-7 sm:w-8 aspect-[250/413] object-contain rounded-xs shadow-xs ring-1 ring-black/20 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-sm sm:text-base font-bold truncate ${
                              isSelected ? "text-yellow-300" : "text-white"
                            }`}
                          >
                            {opt.label}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                        {opt.sublabel && (
                          <span
                            className={`text-xs block truncate ${
                              isSelected
                                ? "text-yellow-200/80"
                                : "text-emerald-300/80"
                            }`}
                          >
                            {opt.sublabel}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Checkmark indicator */}
                    <div className="shrink-0 flex items-center pr-1">
                      {isSelected ? (
                        <span className="size-6 rounded-full bg-yellow-400 text-emerald-950 font-black text-xs flex items-center justify-center shadow-xs">
                          ✓
                        </span>
                      ) : (
                        <span className="size-6 rounded-full border border-emerald-700/80 bg-emerald-950/50 flex items-center justify-center" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
