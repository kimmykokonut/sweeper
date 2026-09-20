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
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-3 sm:p-4 backdrop-blur-xs cursor-pointer"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl overflow-hidden text-white cursor-default"
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
