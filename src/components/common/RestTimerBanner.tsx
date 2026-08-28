import React from "react";
import { Timer, X, Plus, Minus, Check } from "lucide-react";
import { useFitness } from "../../context/FitnessContext";

export const RestTimerBanner: React.FC = () => {
  const { restTimer, stopRestTimer, adjustRestTimer } = useFitness();

  if (!restTimer.isRunning || restTimer.remainingSeconds <= 0) return null;

  const minutes = Math.floor(restTimer.remainingSeconds / 60);
  const seconds = restTimer.remainingSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  const percent = ((restTimer.totalSeconds - restTimer.remainingSeconds) / restTimer.totalSeconds) * 100;

  return (
    <div className="fixed bottom-16 lg:bottom-6 right-4 z-40 max-w-sm w-full bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#1f1f1f] rounded-2xl p-3.5 shadow-2xl shadow-black/50 animate-slide-up">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400">
            <Timer className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#ededed]">Rest Timer</p>
            <p className="text-[10px] text-white/40 truncate max-w-[140px]">
              {restTimer.exerciseName || "Next set coming up"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => adjustRestTimer(-15)}
            className="p-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-white/60 text-xs font-mono"
            title="Subtract 15s"
          >
            -15s
          </button>
          <button
            onClick={() => adjustRestTimer(15)}
            className="p-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-white/60 text-xs font-mono"
            title="Add 15s"
          >
            +15s
          </button>
          <button
            onClick={stopRestTimer}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 hover:text-rose-400 text-white/60 transition-colors"
            title="Dismiss timer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between font-mono text-xl font-bold text-[#ededed] my-1">
        <span>{formattedTime}</span>
        <span className="text-xs font-normal text-white/40">Ready soon</span>
      </div>

      <div className="w-full bg-[#161616] h-1.5 rounded-full overflow-hidden mt-2">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
