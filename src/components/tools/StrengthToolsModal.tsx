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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-gray-200/80 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-modal">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-900 border border-gray-200/60 flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4 text-gray-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Strength Utilities</h2>
              <p className="text-xs text-gray-500">
                Barbell Plate Math · 1RM Estimator · Warmup Ramp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 border-b border-gray-100 bg-gray-50/60 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 p-1 bg-gray-200/60 rounded-xl w-full">
            <button
              onClick={() => setActiveTab("plates")}
              className={`flex-1 min-w-fit px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-150 ${
                activeTab === "plates"
                  ? "bg-white text-gray-900 shadow-xs font-bold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/40"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Plate Calculator</span>
            </button>

            <button
              onClick={() => setActiveTab("1rm")}
              className={`flex-1 min-w-fit px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-150 ${
                activeTab === "1rm"
                  ? "bg-white text-gray-900 shadow-xs font-bold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/40"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Rep Max (1RM)</span>
            </button>

            <button
              onClick={() => setActiveTab("warmup")}
              className={`flex-1 min-w-fit px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-150 ${
                activeTab === "warmup"
                  ? "bg-white text-gray-900 shadow-xs font-bold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/40"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Warmup Ramp</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* TAB 1: PLATE CALCULATOR */}
          {activeTab === "plates" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-900 block mb-1.5 font-semibold">
                    Target Total Weight ({userProfile.preferredUnits})
                  </label>
                  <input
                    type="number"
                    step="2.5"
                    min="45"
                    max="1000"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(Number(e.target.value) || 45)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-lg font-mono font-bold text-gray-900 focus:outline-none focus:border-gray-200"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[135, 185, 225, 275, 315, 365, 405].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setTargetWeight(w)}
                        className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border transition-colors ${
                          targetWeight === w
                            ? "bg-gray-900 text-white border-gray-200"
                            : "bg-gray-50 text-gray-500 border-gray-100 hover:text-gray-900 hover:bg-white"
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-900 block mb-1.5 font-semibold">
                    Barbell Weight ({userProfile.preferredUnits})
                  </label>
                  <select
                    value={barWeight}
                    onChange={(e) => setBarWeight(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm font-medium text-gray-900 focus:outline-none focus:border-gray-200"
                  >
                    <option value={45}>45 lbs (Standard Olympic Bar)</option>
                    <option value={35}>35 lbs (Women's / Multi-Purpose)</option>
                    <option value={25}>25 lbs (Technique / EZ-Curl Bar)</option>
                    <option value={0}>0 lbs (Machine / Smith Carriage)</option>
                  </select>
                  <p className="text-[11px] text-gray-500 font-mono mt-2">
                    Per Side Weight Required:{" "}
                    <strong className="text-gray-900 font-bold">{plateResult.weightPerSide} {userProfile.preferredUnits}</strong>
                  </p>
                </div>
              </div>

              {/* Visual Barbell Diagram */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Plates Needed Per Side
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-500">
                    Total: {targetWeight} {userProfile.preferredUnits}
                  </span>
                </div>

                {/* Plates Visual Stack */}
                <div className="flex items-center gap-2 py-4 px-2 overflow-x-auto border-y border-gray-100 bg-white rounded-xl">
                  {/* Bar Collar */}
                  <div className="w-4 h-16 bg-slate-400 rounded-l border border-slate-500 flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold transform -rotate-90">BAR</span>
                  </div>

                  {/* Loaded Plates */}
                  {plateResult.loadedPlates.length > 0 ? (
                    plateResult.loadedPlates.flatMap((p, idx) =>
                      Array.from({ length: p.count }).map((_, cIdx) => (
                        <div
                          key={`${idx}-${cIdx}`}
                          className={`h-20 w-8 rounded flex flex-col items-center justify-center border text-[11px] font-mono font-bold shadow-xs shrink-0 transition-transform ${p.color}`}
                        >
                          <span>{p.weight}</span>
                        </div>
                      ))
                    )
                  ) : (
                    <div className="text-xs text-gray-400 py-4 italic">
                      Empty Bar (No plates needed per side)
                    </div>
                  )}

                  {/* Bar Sleeve */}
                  <div className="flex-1 h-6 bg-slate-300 rounded-r border border-slate-400 min-w-[60px]" />
                </div>

                {/* Breakdown List */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {plateResult.loadedPlates.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white border border-gray-100 flex items-center justify-between shadow-xs"
                    >
                      <span className="text-xs font-semibold text-gray-900">
                        {p.weight} {userProfile.preferredUnits} Plate
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200/20">
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
                  <label className="text-xs text-gray-900 block mb-1.5 font-semibold">
                    Weight Lifted ({userProfile.preferredUnits})
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="10"
                    value={liftWeight}
                    onChange={(e) => setLiftWeight(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-lg font-mono font-bold text-gray-900 focus:outline-none focus:border-gray-200"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-900 block mb-1.5 font-semibold">
                    Reps Completed (Clean Form)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={liftReps}
                    onChange={(e) => setLiftReps(Math.min(15, Math.max(1, Number(e.target.value) || 1)))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-lg font-mono font-bold text-gray-900 focus:outline-none focus:border-gray-200"
                  />
                </div>
              </div>

              {/* 1RM Highlight Card */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    ESTIMATED 1-REP MAX
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-mono font-black text-gray-900">
                      {oneRM.avg}
                    </span>
                    <span className="text-sm font-mono font-bold text-gray-500">{userProfile.preferredUnits}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    Epley: {oneRM.epley} · Brzycki: {oneRM.brzycki} {userProfile.preferredUnits}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-gray-100 text-xs font-mono text-gray-900 space-y-1 shadow-xs">
                  <div>80% Working Load: <strong className="text-amber-500 font-bold">{Math.round(oneRM.avg * 0.8)} {userProfile.preferredUnits}</strong> (7-8 reps)</div>
                  <div>70% Volume Load: <strong className="text-blue-500 font-bold">{Math.round(oneRM.avg * 0.7)} {userProfile.preferredUnits}</strong> (10-12 reps)</div>
                </div>
              </div>

              {/* Percentage Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Training Load Percentages
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {oneRM.percentages.map((p) => (
                    <div
                      key={p.pct}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1 hover:border-gray-200 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 font-mono">{p.pct}%</span>
                        <span className="text-[10px] text-gray-500">{p.reps}</span>
                      </div>
                      <p className="text-base font-mono font-bold text-gray-900">
                        {p.load} <span className="text-xs font-normal text-gray-500">{userProfile.preferredUnits}</span>
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
                <label className="text-xs text-gray-900 block mb-1.5 font-semibold">
                  Target Working Set Weight ({userProfile.preferredUnits})
                </label>
                <input
                  type="number"
                  step="5"
                  min="45"
                  value={workingWeight}
                  onChange={(e) => setWorkingWeight(Number(e.target.value) || 45)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-lg font-mono font-bold text-gray-900 focus:outline-none focus:border-gray-200 max-w-sm"
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Optimal CNS & Muscular Ramp-Up Progression
                </h4>

                <div className="space-y-2">
                  {warmupSets.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        step.percent === "100%"
                          ? "bg-gray-100 border-gray-200/30 text-gray-900"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-gray-500 w-20">
                          {step.set}
                        </span>
                        <div>
                          <p className="text-sm font-mono font-bold text-gray-900">
                            {step.weight} {userProfile.preferredUnits} × {step.reps}
                          </p>
                          <p className="text-[11px] text-gray-500 font-mono">{step.note}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono text-gray-500 block">Rest</span>
                        <span className="text-xs font-mono font-bold text-amber-500">{step.rest}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500 font-mono">
          <span>FatBot Strength Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-gray-100 hover:bg-gray-100 text-gray-900 text-xs font-bold transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
