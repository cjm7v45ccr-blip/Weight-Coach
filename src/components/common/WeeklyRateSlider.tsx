import React, { useState, useMemo } from "react";
import {
  TrendingDown,
  TrendingUp,
  Scale,
  Zap,
  Info,
  Sliders,
  Flame,
  Utensils,
  Footprints,
  Droplets,
  RotateCcw,
  Sparkles,
  Layers,
} from "lucide-react";
import { UserProfile } from "../../types";

export interface TargetValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  steps?: number;
  waterMl?: number;
}

interface WeeklyRateSliderProps {
  userProfile: UserProfile;
  currentCalories: number;
  currentProtein?: number;
  currentCarbs?: number;
  currentFat?: number;
  currentSteps?: number;
  currentWaterMl?: number;
  onTargetsChange?: (newTargets: TargetValues) => void;
  onCaloriesChange?: (newCalories: number, suggestedMacros?: { protein: number; carbs: number; fat: number }) => void;
  compact?: boolean;
}

export const WeeklyRateSlider: React.FC<WeeklyRateSliderProps> = ({
  userProfile,
  currentCalories,
  currentProtein,
  currentCarbs,
  currentFat,
  currentSteps,
  currentWaterMl,
  onTargetsChange,
  onCaloriesChange,
  compact = false,
}) => {
  const isLbs = userProfile.preferredUnits === "lbs";
  const weight = userProfile.currentWeight || (isLbs ? 175 : 80);
  const goalWeight = userProfile.goalWeight || (isLbs ? 165 : 75);
  const weightDiff = Math.abs(weight - goalWeight);

  const [activeTab, setActiveTab] = useState<"master_pace" | "macro_sliders" | "activity_sliders">("master_pace");
  const [macroLock, setMacroLock] = useState<"none" | "protein" | "carbs" | "fat">("protein");

  // Effective values
  const effProtein = currentProtein ?? userProfile.dailyTargets.protein;
  const effCarbs = currentCarbs ?? userProfile.dailyTargets.carbs;
  const effFat = currentFat ?? userProfile.dailyTargets.fat;
  const effSteps = currentSteps ?? userProfile.dailyTargets.steps;
  const effWater = currentWaterMl ?? userProfile.dailyTargets.waterMl;

  // Compute estimated baseline maintenance TDEE based on activity & weight & steps
  const estimatedMaintenance = useMemo(() => {
    const weightInLbs = isLbs ? weight : weight * 2.20462;
    let multiplier = 14.5;
    if (userProfile.activityLevel === "sedentary") multiplier = 13.5;
    else if (userProfile.activityLevel === "lightly_active") multiplier = 14.2;
    else if (userProfile.activityLevel === "moderately_active") multiplier = 15.0;
    else if (userProfile.activityLevel === "very_active") multiplier = 16.5;

    const workoutBonus = (userProfile.weeklyWorkoutTarget || 4) * 25;
    // Step contribution adjustment relative to 8000 baseline
    const stepDiffBonus = ((effSteps - 8000) / 1000) * 40;
    return Math.max(1500, Math.round(weightInLbs * multiplier + workoutBonus + stepDiffBonus));
  }, [weight, isLbs, userProfile.activityLevel, userProfile.weeklyWorkoutTarget, effSteps]);

  // Current daily delta (negative = deficit, positive = surplus)
  const dailyDelta = currentCalories - estimatedMaintenance;

  // Weekly rate in lbs/week
  const weeklyRateLbs = useMemo(() => {
    return (dailyDelta * 7) / 3500;
  }, [dailyDelta]);

  // Weekly rate in user units
  const weeklyRateDisplay = useMemo(() => {
    return isLbs ? weeklyRateLbs : weeklyRateLbs * 0.453592;
  }, [weeklyRateLbs, isLbs]);

  // Estimated weeks to goal
  const estimatedWeeksToGoal = useMemo(() => {
    if (Math.abs(weeklyRateDisplay) < 0.05 || weightDiff <= 0) return null;
    const isLosing = goalWeight < weight;
    if (isLosing && weeklyRateDisplay >= 0) return "In surplus (increase deficit to lose weight)";
    if (!isLosing && weeklyRateDisplay <= 0) return "In deficit (increase surplus to gain weight)";
    
    const weeks = Math.ceil(weightDiff / Math.abs(weeklyRateDisplay));
    return weeks > 0 && weeks < 100 ? `~${weeks} weeks` : "Ongoing maintenance";
  }, [weeklyRateDisplay, weightDiff, goalWeight, weight]);

  // Classification
  const rateClassification = useMemo(() => {
    if (dailyDelta < -850) {
      return {
        label: "Aggressive Deficit",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        description: "Accelerated fat loss. Higher protein & NEAT steps recommended to protect lean muscle.",
      };
    } else if (dailyDelta <= -350) {
      return {
        label: "Optimal Fat Loss",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        description: "Optimal zone for consistent fat loss while maintaining strength and gym performance.",
      };
    } else if (dailyDelta < -100) {
      return {
        label: "Mild Steady Cut",
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        description: "Gradual fat loss with minimal hunger and peak workout recovery.",
      };
    } else if (dailyDelta <= 100) {
      return {
        label: "Caloric Maintenance",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        description: "Energy balance. Ideal for recomp, strength progression, and athletic performance.",
      };
    } else if (dailyDelta <= 350) {
      return {
        label: "Lean Hypertrophy Surplus",
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        description: "Controlled surplus to fuel new contractile tissue while keeping fat gain low.",
      };
    } else {
      return {
        label: "Accelerated Mass Surplus",
        color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
        description: "High caloric surplus for maximum muscular hypertrophy and strength output.",
      };
    }
  }, [dailyDelta]);

  // Unified update helper
  const emitTargetChanges = (updated: TargetValues) => {
    if (onTargetsChange) {
      onTargetsChange(updated);
    }
    if (onCaloriesChange) {
      onCaloriesChange(updated.calories, {
        protein: updated.protein,
        carbs: updated.carbs,
        fat: updated.fat,
      });
    }
  };

  // 1. MASTER PACE SLIDER HANDLER (Adjusts Calories, Protein, Carbs, Fat, Steps, Water simultaneously)
  const handleMasterPaceChange = (delta: number) => {
    const newCal = Math.max(1200, Math.round(estimatedMaintenance + delta));
    const weightInLbs = isLbs ? weight : weight * 2.20462;

    // Dynamic protein scaling: higher g/lb in deeper deficits
    let proteinPerLb = 0.95;
    if (delta < -600) proteinPerLb = 1.05; // 1.05g/lb for aggressive cut
    else if (delta < -300) proteinPerLb = 1.0;
    else if (delta > 200) proteinPerLb = 0.88; // slightly lower protein in surplus since carbs spare protein

    const proteinG = Math.round(weightInLbs * proteinPerLb);

    // Fat: 22-25% of total calories (min 45g for hormonal health)
    const fatG = Math.max(45, Math.round((newCal * 0.23) / 9));

    // Carbs: Remaining calories
    const remainingCal = Math.max(0, newCal - (proteinG * 4 + fatG * 9));
    const carbG = Math.round(remainingCal / 4);

    // Dynamic Steps Recommendation
    let suggestedSteps = 8000;
    if (delta < -600) suggestedSteps = 10000;
    else if (delta < -300) suggestedSteps = 9000;
    else if (delta < 0) suggestedSteps = 8500;
    else suggestedSteps = 8000;

    // Dynamic Hydration
    let suggestedWater = 2800;
    if (delta < -300 || weightInLbs > 180) suggestedWater = 3200;

    emitTargetChanges({
      calories: newCal,
      protein: proteinG,
      carbs: carbG,
      fat: fatG,
      steps: suggestedSteps,
      waterMl: suggestedWater,
    });
  };

  // 2. MACRO SLIDER HANDLERS
  const handleProteinSlider = (newP: number) => {
    const calFromP = newP * 4;
    const calFromF = effFat * 9;
    const currentTotal = currentCalories;

    // If protein changes, adjust carbs to keep total calories intact
    const remainingForC = Math.max(20, currentTotal - (calFromP + calFromF));
    const newC = Math.round(remainingForC / 4);

    emitTargetChanges({
      calories: currentTotal,
      protein: newP,
      carbs: newC,
      fat: effFat,
      steps: effSteps,
      waterMl: effWater,
    });
  };

  const handleCarbSlider = (newC: number) => {
    // When carbs change, adjust total calories
    const newTotal = Math.round(effProtein * 4 + newC * 4 + effFat * 9);
    emitTargetChanges({
      calories: newTotal,
      protein: effProtein,
      carbs: newC,
      fat: effFat,
      steps: effSteps,
      waterMl: effWater,
    });
  };

  const handleFatSlider = (newF: number) => {
    // When fat changes, adjust total calories
    const newTotal = Math.round(effProtein * 4 + effCarbs * 4 + newF * 9);
    emitTargetChanges({
      calories: newTotal,
      protein: effProtein,
      carbs: effCarbs,
      fat: newF,
      steps: effSteps,
      waterMl: effWater,
    });
  };

  const handleStepSlider = (newSteps: number) => {
    emitTargetChanges({
      calories: currentCalories,
      protein: effProtein,
      carbs: effCarbs,
      fat: effFat,
      steps: newSteps,
      waterMl: effWater,
    });
  };

  const handleWaterSlider = (newWater: number) => {
    emitTargetChanges({
      calories: currentCalories,
      protein: effProtein,
      carbs: effCarbs,
      fat: effFat,
      steps: effSteps,
      waterMl: newWater,
    });
  };

  // Preset Splits
  const applyPresetSplit = (splitName: "high_protein" | "balanced" | "keto_lowcarb" | "high_carb") => {
    const cal = currentCalories;
    let p = effProtein;
    let c = effCarbs;
    let f = effFat;

    if (splitName === "high_protein") {
      // 40% P / 35% C / 25% F
      p = Math.round((cal * 0.4) / 4);
      f = Math.round((cal * 0.25) / 9);
      c = Math.round((cal - (p * 4 + f * 9)) / 4);
    } else if (splitName === "balanced") {
      // 30% P / 45% C / 25% F
      p = Math.round((cal * 0.3) / 4);
      f = Math.round((cal * 0.25) / 9);
      c = Math.round((cal - (p * 4 + f * 9)) / 4);
    } else if (splitName === "keto_lowcarb") {
      // 35% P / 10% C / 55% F
      p = Math.round((cal * 0.35) / 4);
      c = Math.round((cal * 0.1) / 4);
      f = Math.round((cal - (p * 4 + c * 4)) / 9);
    } else if (splitName === "high_carb") {
      // 25% P / 55% C / 20% F
      p = Math.round((cal * 0.25) / 4);
      f = Math.round((cal * 0.2) / 9);
      c = Math.round((cal - (p * 4 + f * 9)) / 4);
    }

    emitTargetChanges({
      calories: cal,
      protein: p,
      carbs: c,
      fat: f,
      steps: effSteps,
      waterMl: effWater,
    });
  };

  // Macro calorie shares
  const pCal = effProtein * 4;
  const cCal = effCarbs * 4;
  const fCal = effFat * 9;
  const sumCal = Math.max(1, pCal + cCal + fCal);
  const pPct = Math.round((pCal / sumCal) * 100);
  const cPct = Math.round((cCal / sumCal) * 100);
  const fPct = Math.max(0, 100 - (pPct + cPct));

  const presetRates = [
    { label: "Aggressive Cut (-1.5 lb/wk)", delta: -750 },
    { label: "Optimal Fat Loss (-1.0 lb/wk)", delta: -500 },
    { label: "Steady Cut (-0.5 lb/wk)", delta: -250 },
    { label: "Maintenance (0 lb/wk)", delta: 0 },
    { label: "Lean Surplus (+0.5 lb/wk)", delta: 250 },
  ];

  return (
    <div
      id="weekly-rate-multi-adjuster"
      className={`rounded-xl bg-[#0a0a0a] border border-[#1e1e1e] ${compact ? "p-3.5 space-y-3" : "p-4 sm:p-5 space-y-4"}`}
    >
      {/* Top Banner: Navigation Tabs & Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold text-[#ededed]">Weekly Deficit & Targets Engine</h4>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${rateClassification.color}`}>
                {rateClassification.label}
              </span>
            </div>
            <p className="text-[11px] text-white/50">
              Maintenance TDEE: <span className="font-mono text-white/80">{estimatedMaintenance.toLocaleString()} kcal/day</span>
            </p>
          </div>
        </div>

        {/* Big Calculated Rate Outcome */}
        <div className="flex items-center sm:justify-end gap-3 bg-white/[0.02] sm:bg-transparent p-2 sm:p-0 rounded-lg border sm:border-0 border-white/[0.05]">
          <div className="text-left sm:text-right">
            <div className="text-xs font-mono font-bold flex items-center sm:justify-end gap-1.5">
              {weeklyRateDisplay < 0 ? (
                <TrendingDown className="w-4 h-4 text-emerald-400" />
              ) : weeklyRateDisplay > 0 ? (
                <TrendingUp className="w-4 h-4 text-purple-400" />
              ) : (
                <Zap className="w-4 h-4 text-amber-400" />
              )}
              <span
                className={
                  weeklyRateDisplay < 0
                    ? "text-emerald-400 text-sm font-extrabold"
                    : weeklyRateDisplay > 0
                    ? "text-purple-400 text-sm font-extrabold"
                    : "text-amber-400 text-sm font-extrabold"
                }
              >
                {weeklyRateDisplay > 0 ? "+" : ""}
                {weeklyRateDisplay.toFixed(2)} {isLbs ? "lbs/wk" : "kg/wk"}
              </span>
            </div>
            <div className="text-[10px] font-mono text-white/50">
              {dailyDelta < 0 ? `${Math.abs(dailyDelta)} kcal/day deficit` : dailyDelta > 0 ? `+${dailyDelta} kcal/day surplus` : "At exact balance"}
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between gap-1 bg-[#121212] p-1 rounded-lg border border-[#1f1f1f]">
        <button
          type="button"
          onClick={() => setActiveTab("master_pace")}
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "master_pace"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Smart Pace Slider</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("macro_sliders")}
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "macro_sliders"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Macro Sliders</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("activity_sliders")}
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "activity_sliders"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <Footprints className="w-3.5 h-3.5" />
          <span>Steps & Water</span>
        </button>
      </div>

      {/* TAB 1: MASTER PACE SLIDER */}
      {activeTab === "master_pace" && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
            <span className="text-rose-400">-1.5 {isLbs ? "lbs" : "kg"}/wk (Cut)</span>
            <span className="text-white/80 font-semibold">Move Bar to Adjust Pace</span>
            <span className="text-purple-400">+1.0 {isLbs ? "lbs" : "kg"}/wk (Bulk)</span>
          </div>

          <div className="relative flex items-center">
            <input
              type="range"
              id="master-pace-slider-bar"
              min="-1000"
              max="600"
              step="25"
              value={dailyDelta}
              onChange={(e) => handleMasterPaceChange(Number(e.target.value))}
              className="w-full h-2.5 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
            />
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {presetRates.map((preset) => {
              const isSelected = Math.abs(dailyDelta - preset.delta) < 40;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleMasterPaceChange(preset.delta)}
                  className={`px-2 py-1.5 text-[10px] font-mono rounded-md border transition-all text-center truncate ${
                    isSelected
                      ? "bg-blue-600/20 border-blue-500/50 text-blue-300 font-semibold"
                      : "bg-[#141414] border-[#222] text-white/50 hover:text-white/80 hover:bg-[#1a1a1a]"
                  }`}
                  title={preset.label}
                >
                  {preset.label.split("(")[0].trim()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INDIVIDUAL MACRO SLIDERS */}
      {activeTab === "macro_sliders" && (
        <div className="space-y-4 animate-fade-in">
          {/* Quick Macro Ratio Presets */}
          <div className="flex flex-wrap gap-1.5 items-center justify-between pb-1">
            <span className="text-[10px] font-mono text-white/40 uppercase">Macro Splits:</span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => applyPresetSplit("high_protein")}
                className="px-2 py-0.5 text-[10px] rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/70"
              >
                High Protein (40/35/25)
              </button>
              <button
                type="button"
                onClick={() => applyPresetSplit("balanced")}
                className="px-2 py-0.5 text-[10px] rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/70"
              >
                Zone Balance (30/45/25)
              </button>
              <button
                type="button"
                onClick={() => applyPresetSplit("high_carb")}
                className="px-2 py-0.5 text-[10px] rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/70"
              >
                High Carb (25/55/20)
              </button>
              <button
                type="button"
                onClick={() => applyPresetSplit("keto_lowcarb")}
                className="px-2 py-0.5 text-[10px] rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/70"
              >
                Low Carb (35/10/55)
              </button>
            </div>
          </div>

          {/* Protein Slider */}
          <div className="space-y-1.5 bg-[#121212] p-2.5 rounded-lg border border-[#1e1e1e]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                Protein
              </span>
              <span className="font-mono text-white/90 font-bold">
                {effProtein}g <span className="text-white/40 text-[10px]">({pCal} kcal · {pPct}%)</span>
              </span>
            </div>
            <input
              type="range"
              min="80"
              max="260"
              step="5"
              value={effProtein}
              onChange={(e) => handleProteinSlider(Number(e.target.value))}
              className="w-full h-1.5 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-blue-400"
            />
            <div className="flex justify-between text-[9px] font-mono text-white/40">
              <span>80g (0.5g/lb)</span>
              <span>170g (1.0g/lb)</span>
              <span>260g (1.5g/lb)</span>
            </div>
          </div>

          {/* Carbs Slider */}
          <div className="space-y-1.5 bg-[#121212] p-2.5 rounded-lg border border-[#1e1e1e]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Carbohydrates
              </span>
              <span className="font-mono text-white/90 font-bold">
                {effCarbs}g <span className="text-white/40 text-[10px]">({cCal} kcal · {cPct}%)</span>
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="450"
              step="5"
              value={effCarbs}
              onChange={(e) => handleCarbSlider(Number(e.target.value))}
              className="w-full h-1.5 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[9px] font-mono text-white/40">
              <span>30g (Low Carb)</span>
              <span>200g (Moderate)</span>
              <span>450g (High Energy)</span>
            </div>
          </div>

          {/* Fat Slider */}
          <div className="space-y-1.5 bg-[#121212] p-2.5 rounded-lg border border-[#1e1e1e]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                Fats
              </span>
              <span className="font-mono text-white/90 font-bold">
                {effFat}g <span className="text-white/40 text-[10px]">({fCal} kcal · {fPct}%)</span>
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="140"
              step="2"
              value={effFat}
              onChange={(e) => handleFatSlider(Number(e.target.value))}
              className="w-full h-1.5 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-rose-400"
            />
            <div className="flex justify-between text-[9px] font-mono text-white/40">
              <span>30g (Lean)</span>
              <span>60g (Balanced)</span>
              <span>140g (Keto)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVITY & WATER SLIDERS */}
      {activeTab === "activity_sliders" && (
        <div className="space-y-4 animate-fade-in">
          {/* Steps Slider */}
          <div className="space-y-1.5 bg-[#121212] p-2.5 rounded-lg border border-[#1e1e1e]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5" />
                Daily Step Target (NEAT)
              </span>
              <span className="font-mono text-white/90 font-bold">
                {effSteps.toLocaleString()} <span className="text-white/40 text-[10px]">steps/day</span>
              </span>
            </div>
            <input
              type="range"
              min="4000"
              max="18000"
              step="500"
              value={effSteps}
              onChange={(e) => handleStepSlider(Number(e.target.value))}
              className="w-full h-1.5 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[9px] font-mono text-white/40">
              <span>4,000 (Desk)</span>
              <span>8,500 (Active)</span>
              <span>18,000 (Athlete)</span>
            </div>
          </div>

          {/* Water Slider */}
          <div className="space-y-1.5 bg-[#121212] p-2.5 rounded-lg border border-[#1e1e1e]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5" />
                Daily Water Hydration
              </span>
              <span className="font-mono text-white/90 font-bold">
                {effWater.toLocaleString()} <span className="text-white/40 text-[10px]">ml ({Math.round(effWater / 240)} cups)</span>
              </span>
            </div>
            <input
              type="range"
              min="1500"
              max="5000"
              step="100"
              value={effWater}
              onChange={(e) => handleWaterSlider(Number(e.target.value))}
              className="w-full h-1.5 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[9px] font-mono text-white/40">
              <span>1,500 ml</span>
              <span>2,800 ml (Optimal)</span>
              <span>5,000 ml</span>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Macro Distribution Visual Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
          <span>Macro Energy Breakdown</span>
          <span className="text-white/80 font-bold">{currentCalories.toLocaleString()} total kcal</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden flex bg-[#161616]">
          <div style={{ width: `${pPct}%` }} className="bg-blue-500 transition-all" title={`Protein: ${pPct}%`} />
          <div style={{ width: `${cPct}%` }} className="bg-amber-400 transition-all" title={`Carbs: ${cPct}%`} />
          <div style={{ width: `${fPct}%` }} className="bg-rose-500 transition-all" title={`Fat: ${fPct}%`} />
        </div>
        <div className="flex justify-between text-[10px] font-mono pt-0.5">
          <span className="text-blue-400 font-medium">● {effProtein}g P ({pPct}%)</span>
          <span className="text-amber-400 font-medium">● {effCarbs}g C ({cPct}%)</span>
          <span className="text-rose-400 font-medium">● {effFat}g F ({fPct}%)</span>
          <span className="text-emerald-400 font-medium">● {effSteps.toLocaleString()} steps</span>
        </div>
      </div>

      {/* Target Timeline Forecast */}
      <div className="p-3 rounded-lg bg-[#141414] border border-[#222] space-y-1">
        <div className="flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <p className="text-white/70 leading-relaxed text-[11px]">
              {rateClassification.description}
            </p>
            {estimatedWeeksToGoal && (
              <p className="text-[11px] font-mono text-emerald-400 font-medium">
                🎯 Target Timeline: <span className="underline">{estimatedWeeksToGoal}</span> to reach {goalWeight} {userProfile.preferredUnits} from current {weight} {userProfile.preferredUnits}.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
