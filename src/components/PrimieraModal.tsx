import { useEffect } from "react";
import type { Player } from "../types";
import PrimieraCalculator from "./PrimieraCalculator";

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
  // Close on Escape key press (stops propagation to parent modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto bg-black/75 p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xs cursor-pointer"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div
        className="relative flex max-h-[calc(100dvh-1.5rem)] sm:max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl overflow-hidden text-white cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <PrimieraCalculator
          players={players}
          mode="modal"
          onApplyWinner={onApplyWinner}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
