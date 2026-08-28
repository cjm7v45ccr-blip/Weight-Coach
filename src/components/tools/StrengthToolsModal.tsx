import React, { useState } from "react";
import {
  X,
  Dumbbell,
  Calculator,
  Flame,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { useFitness } from "../../context/FitnessContext";

interface StrengthToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "plates" | "1rm" | "warmup" | "macro_math";
}

export const StrengthToolsModal: React.FC<StrengthToolsModalProps> = ({
  isOpen,
  onClose,
  initialTab = "plates",
}) => {
  const { userProfile } = useFitness();
  const [activeTab, setActiveTab] = useState<"plates" | "1rm" | "warmup" | "macro_math">(initialTab);

  // Plate Calculator State
  const [targetWeight, setTargetWeight] = useState<number>(225);
  const [barWeight, setBarWeight] = useState<number>(45);

  // 1RM State
  const [liftWeight, setLiftWeight] = useState<number>(205);
  const [liftReps, setLiftReps] = useState<number>(6);

  // Warmup Generator State
  const [workingWeight, setWorkingWeight] = useState<number>(225);

  if (!isOpen) return null;

  // Plate Math Calculation
  const calculatePlates = (total: number, bar: number) => {
    const weightPerSide = Math.max(0, (total - bar) / 2);
    const availablePlates = [45, 35, 25, 10, 5, 2.5];
    const plateColors: Record<number, string> = {
      45: "bg-blue-600 border-blue-400 text-white",
      35: "bg-amber-600 border-amber-400 text-white",
      25: "bg-emerald-600 border-emerald-400 text-white",
      10: "bg-purple-600 border-purple-400 text-white",
      5: "bg-zinc-300 border-zinc-100 text-zinc-900",
      2.5: "bg-zinc-600 border-zinc-400 text-white",
    };

    let remaining = weightPerSide;
    const loadedPlates: { weight: number; count: number; color: string }[] = [];

    for (const plate of availablePlates) {
      const count = Math.floor(remaining / plate);
      if (count > 0) {
        loadedPlates.push({
          weight: plate,
          count,
          color: plateColors[plate] || "bg-zinc-700 text-white",
        });
        remaining = Math.round((remaining - count * plate) * 10) / 10;
      }
    }

    return {
      weightPerSide,
      loadedPlates,
      unaccounted: remaining,
    };
  };

  const plateResult = calculatePlates(targetWeight, barWeight);

  // 1RM Formulas
  const calculate1RM = (weight: number, reps: number) => {
    const validReps = Math.max(1, reps);
    const epley = validReps === 1 ? weight : Math.round(weight * (1 + validReps / 30));
    const brzycki = validReps === 1 ? weight : Math.round(weight * (36 / Math.max(1, (37 - validReps))));
    const avg = Math.round((epley + brzycki) / 2);

    const percentages = [
      { pct: 100, reps: "1 rep (1RM)", load: avg },
      { pct: 95, reps: "2 reps", load: Math.round(avg * 0.95) },
      { pct: 90, reps: "3-4 reps", load: Math.round(avg * 0.9) },
      { pct: 85, reps: "5-6 reps", load: Math.round(avg * 0.85) },
      { pct: 80, reps: "7-8 reps", load: Math.round(avg * 0.8) },
      { pct: 75, reps: "9-10 reps", load: Math.round(avg * 0.75) },
      { pct: 70, reps: "11-12 reps", load: Math.round(avg * 0.7) },
      { pct: 65, reps: "13-15 reps", load: Math.round(avg * 0.65) },
    ];

    return { avg, epley, brzycki, percentages };
  };

  const oneRM = calculate1RM(liftWeight, liftReps);

  // Warmup Sequence
  const calculateWarmup = (work: number) => {
    return [
      {
        set: "Warmup 1",
        percent: "Bar Only",
        weight: barWeight,
        reps: "10 reps",
        rest: "30s",
        note: "Groove bar path & mobility",
      },
      {
        set: "Warmup 2",
        percent: "50%",
        weight: Math.round((work * 0.5) / 5) * 5,
        reps: "5 reps",
        rest: "45s",
        note: "Explosive concentric tempo",
      },
      {
        set: "Warmup 3",
        percent: "70%",
        weight: Math.round((work * 0.7) / 5) * 5,
        reps: "3 reps",
        rest: "60s",
        note: "Match working technique",
      },
      {
        set: "Warmup 4",
        percent: "85%",
        weight: Math.round((work * 0.85) / 5) * 5,
        reps: "1 rep",
        rest: "90s",
        note: "Potentiation single (fast)",
      },
      {
        set: "Working Sets",
        percent: "100%",
        weight: work,
        reps: "Target Reps",
        rest: "120-180s",
        note: "Execute target volume",
      },
    ];
  };

  const warmupSets = calculateWarmup(workingWeight);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] bg-[#0c0c0c]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#ededed]">Athletic Strength Utilities</h2>
              <p className="text-xs text-white/40 font-mono">
                Barbell Plate Math · 1RM Estimator · Warmup Ramp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1a1a1a] bg-[#0a0a0a] px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("plates")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "plates"
                ? "text-blue-400 border-blue-500 bg-[#0f0f0f]"
                : "text-white/50 border-transparent hover:text-white/80"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Plate Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab("1rm")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "1rm"
                ? "text-blue-400 border-blue-500 bg-[#0f0f0f]"
                : "text-white/50 border-transparent hover:text-white/80"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>1-Rep Max (1RM)</span>
          </button>

          <button
            onClick={() => setActiveTab("warmup")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "warmup"
                ? "text-blue-400 border-blue-500 bg-[#0f0f0f]"
                : "text-white/50 border-transparent hover:text-white/80"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Warmup Ramp</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: PLATE CALCULATOR */}
          {activeTab === "plates" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/60 block mb-1.5 font-medium">
                    Target Total Weight ({userProfile.preferredUnits})
                  </label>
                  <input
                    type="number"
                    step="2.5"
                    min="45"
                    max="1000"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(Number(e.target.value) || 45)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] text-lg font-mono font-bold text-[#ededed] focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[135, 185, 225, 275, 315, 365, 405].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setTargetWeight(w)}
                        className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors ${
                          targetWeight === w
                            ? "bg-blue-600/20 text-blue-300 border-blue-500/30"
                            : "bg-[#0f0f0f] text-white/60 border-[#1a1a1a] hover:text-white"
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/60 block mb-1.5 font-medium">
                    Barbell Weight ({userProfile.preferredUnits})
                  </label>
                  <select
                    value={barWeight}
                    onChange={(e) => setBarWeight(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] text-sm font-mono text-[#ededed] focus:outline-none focus:border-blue-500"
                  >
                    <option value={45}>45 lbs (Standard Olympic Bar)</option>
                    <option value={35}>35 lbs (Women's / Multi-Purpose)</option>
                    <option value={25}>25 lbs (Technique / EZ-Curl Bar)</option>
                    <option value={0}>0 lbs (Machine / Smith Carriage)</option>
                  </select>
                  <p className="text-[11px] text-white/40 font-mono mt-2">
                    Per Side Weight Required:{" "}
                    <strong className="text-blue-300 font-bold">{plateResult.weightPerSide} {userProfile.preferredUnits}</strong>
                  </p>
                </div>
              </div>

              {/* Visual Barbell Diagram */}
              <div className="p-5 rounded-2xl bg-[#0f0f0f] border border-[#1a1a1a] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#ededed] uppercase tracking-wider">
                    Plates Needed Per Side
                  </span>
                  <span className="text-xs font-mono text-white/50">
                    Total: {targetWeight} {userProfile.preferredUnits}
                  </span>
                </div>

                {/* Plates Visual Stack */}
                <div className="flex items-center gap-2 py-4 px-2 overflow-x-auto border-y border-[#1a1a1a]">
                  {/* Bar Collar */}
                  <div className="w-4 h-16 bg-zinc-700 rounded-l border border-zinc-500 flex items-center justify-center">
                    <span className="text-[8px] text-zinc-300 transform -rotate-90">BAR</span>
                  </div>

                  {/* Loaded Plates */}
                  {plateResult.loadedPlates.length > 0 ? (
                    plateResult.loadedPlates.flatMap((p, idx) =>
                      Array.from({ length: p.count }).map((_, cIdx) => (
                        <div
                          key={`${idx}-${cIdx}`}
                          className={`h-20 w-8 rounded flex flex-col items-center justify-center border text-[11px] font-mono font-bold shadow-md shrink-0 transition-transform ${p.color}`}
                        >
                          <span>{p.weight}</span>
                        </div>
                      ))
                    )
                  ) : (
                    <div className="text-xs text-white/40 py-4 italic">
                      Empty Bar (No plates needed per side)
                    </div>
                  )}

                  {/* Bar Sleeve */}
                  <div className="flex-1 h-6 bg-zinc-800 rounded-r border border-zinc-700 min-w-[60px]" />
                </div>

                {/* Breakdown List */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {plateResult.loadedPlates.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-between"
                    >
                      <span className="text-xs font-medium text-white/80">
                        {p.weight} {userProfile.preferredUnits} Plate
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        × {p.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 1-REP MAX (1RM) */}
          {activeTab === "1rm" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/60 block mb-1.5 font-medium">
                    Weight Lifted ({userProfile.preferredUnits})
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="10"
                    value={liftWeight}
                    onChange={(e) => setLiftWeight(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] text-lg font-mono font-bold text-[#ededed] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/60 block mb-1.5 font-medium">
                    Reps Completed (Clean Form)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={liftReps}
                    onChange={(e) => setLiftReps(Math.min(15, Math.max(1, Number(e.target.value) || 1)))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] text-lg font-mono font-bold text-[#ededed] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 1RM Highlight Card */}
              <div className="p-5 rounded-2xl bg-[#0f0f0f] border border-[#1a1a1a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400">
                    ESTIMATED 1-REP MAX
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-mono font-black text-[#ededed]">
                      {oneRM.avg}
                    </span>
                    <span className="text-sm font-mono text-white/40">{userProfile.preferredUnits}</span>
                  </div>
                  <p className="text-xs text-white/40 font-mono mt-1">
                    Epley: {oneRM.epley} · Brzycki: {oneRM.brzycki} {userProfile.preferredUnits}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] text-xs font-mono text-white/70 space-y-1">
                  <div>80% Working Load: <strong className="text-blue-300">{Math.round(oneRM.avg * 0.8)} {userProfile.preferredUnits}</strong> (7-8 reps)</div>
                  <div>70% Volume Load: <strong className="text-emerald-300">{Math.round(oneRM.avg * 0.7)} {userProfile.preferredUnits}</strong> (10-12 reps)</div>
                </div>
              </div>

              {/* Percentage Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Training Load Percentages
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {oneRM.percentages.map((p) => (
                    <div
                      key={p.pct}
                      className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-400 font-mono">{p.pct}%</span>
                        <span className="text-[10px] text-white/40">{p.reps}</span>
                      </div>
                      <p className="text-base font-mono font-bold text-[#ededed]">
                        {p.load} <span className="text-xs font-normal text-white/40">{userProfile.preferredUnits}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WARMUP RAMP */}
          {activeTab === "warmup" && (
            <div className="space-y-6">
              <div>
                <label className="text-xs text-white/60 block mb-1.5 font-medium">
                  Target Working Set Weight ({userProfile.preferredUnits})
                </label>
                <input
                  type="number"
                  step="5"
                  min="45"
                  value={workingWeight}
                  onChange={(e) => setWorkingWeight(Number(e.target.value) || 45)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] text-lg font-mono font-bold text-[#ededed] focus:outline-none focus:border-blue-500 max-w-sm"
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Optimal CNS & Muscular Ramp-Up Progression
                </h4>

                <div className="space-y-2">
                  {warmupSets.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        step.percent === "100%"
                          ? "bg-blue-600/10 border-blue-500/30 text-white"
                          : "bg-[#0f0f0f] border-[#1a1a1a]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-white/50 w-20">
                          {step.set}
                        </span>
                        <div>
                          <p className="text-sm font-mono font-bold text-[#ededed]">
                            {step.weight} {userProfile.preferredUnits} × {step.reps}
                          </p>
                          <p className="text-[11px] text-white/40 font-mono">{step.note}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono text-white/50 block">Rest</span>
                        <span className="text-xs font-mono font-bold text-blue-400">{step.rest}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1a1a1a] bg-[#0c0c0c] flex items-center justify-between text-xs text-white/50 font-mono">
          <span>Momentum Athletic Science Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
