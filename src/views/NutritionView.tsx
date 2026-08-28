import React, { useState } from "react";
import {
  UtensilsCrossed,
  Sparkles,
  Plus,
  Flame,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Search,
  Sliders,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useFitness } from "../context/FitnessContext";
import { MacroCard } from "../components/common/MacroCard";
import { MealCard } from "../components/nutrition/MealCard";
import { ProgressBar } from "../components/common/ProgressBar";
import { WeeklyRateSlider } from "../components/common/WeeklyRateSlider";
import { MealType } from "../types";

interface NutritionViewProps {
  onOpenFoodLogger: (mealType?: MealType) => void;
}

export const NutritionView: React.FC<NutritionViewProps> = ({ onOpenFoodLogger }) => {
  const {
    userProfile,
    todayTotals,
    remainingMacros,
    todayFoodEntries,
    deleteFoodItem,
    todayWaterMl,
    logWater,
    updateDailyTargets,
  } = useFitness();

  const [showPaceAdjuster, setShowPaceAdjuster] = useState(true);
  const [quickInput, setQuickInput] = useState("");

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      onOpenFoodLogger("lunch");
    }
  };

  const breakfastItems = todayFoodEntries.filter((f) => f.mealType === "breakfast");
  const lunchItems = todayFoodEntries.filter((f) => f.mealType === "lunch");
  const dinnerItems = todayFoodEntries.filter((f) => f.mealType === "dinner");
  const snackItems = todayFoodEntries.filter((f) => f.mealType === "snack" || f.mealType === "drink");

  // Calorie & Protein percent
  const calPercent = Math.min(100, Math.round((todayTotals.calories / userProfile.dailyTargets.calories) * 100));
  const proPercent = Math.min(100, Math.round((todayTotals.protein / userProfile.dailyTargets.protein) * 100));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* 1. TOP BANNER / AI MEAL LOG TRIGGER */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-semibold">
                AI FAST LOGGING
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#ededed]">
              Nutrition & Macro Operating System
            </h1>
            <p className="text-xs sm:text-sm text-white/60">
              Log complex meals in natural language or choose from verified whole food items.
            </p>
          </div>

          <button
            onClick={() => onOpenFoodLogger("lunch")}
            id="btn-nutrition-open-logger"
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Open Fast Food Logger</span>
          </button>
        </div>
      </section>

      {/* 2. MACRO PROGRESS OVERVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MacroCard
          label="Calories"
          consumed={todayTotals.calories}
          target={userProfile.dailyTargets.calories}
          remaining={remainingMacros.calories}
          unit=" kcal"
          color="blue"
        />
        <MacroCard
          label="Protein"
          consumed={todayTotals.protein}
          target={userProfile.dailyTargets.protein}
          remaining={remainingMacros.protein}
          unit="g"
          color="emerald"
        />
        <MacroCard
          label="Carbohydrates"
          consumed={todayTotals.carbs}
          target={userProfile.dailyTargets.carbs}
          remaining={remainingMacros.carbs}
          unit="g"
          color="amber"
        />
        <MacroCard
          label="Fats"
          consumed={todayTotals.fat}
          target={userProfile.dailyTargets.fat}
          remaining={remainingMacros.fat}
          unit="g"
          color="rose"
        />
      </div>

      {/* 3. WEEKLY RATE OF LOSS & DEFICIT PACE SLIDER */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowPaceAdjuster(!showPaceAdjuster)}
            className="flex items-center gap-2 text-xs font-semibold text-[#ededed] hover:text-white transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Weekly Loss Pace & Deficit Adjuster</span>
            <span className="text-[10px] font-mono text-white/40 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
              {showPaceAdjuster ? "Hide Slider" : "Show Slider"}
            </span>
            {showPaceAdjuster ? <ChevronUp className="w-3.5 h-3.5 text-white/40" /> : <ChevronDown className="w-3.5 h-3.5 text-white/40" />}
          </button>
        </div>

        {showPaceAdjuster && (
          <WeeklyRateSlider
            userProfile={userProfile}
            currentCalories={userProfile.dailyTargets.calories}
            currentProtein={userProfile.dailyTargets.protein}
            currentCarbs={userProfile.dailyTargets.carbs}
            currentFat={userProfile.dailyTargets.fat}
            currentSteps={userProfile.dailyTargets.steps}
            currentWaterMl={userProfile.dailyTargets.waterMl}
            onTargetsChange={(targets) => {
              updateDailyTargets({
                calories: targets.calories,
                protein: targets.protein,
                carbs: targets.carbs,
                fat: targets.fat,
                steps: targets.steps ?? userProfile.dailyTargets.steps,
                waterMl: targets.waterMl ?? userProfile.dailyTargets.waterMl,
              });
            }}
          />
        )}
      </div>

      {/* 4. NUTRITION GUIDANCE INSIGHT */}
      <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#ededed]">
              {remainingMacros.protein > 25
                ? `You're ${Math.round(remainingMacros.protein)}g away from your protein target.`
                : "You've fulfilled your primary protein target for today!"}
            </p>
            <p className="text-xs text-white/50 leading-relaxed">
              {remainingMacros.protein > 25
                ? "Prioritize a high-protein source (chicken breast, Greek yogurt, or whey isolate) for your next meal."
                : "Great consistency. Balance remaining calories with healthy complex carbs and vegetables."}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 hidden sm:block">
          <span className="text-[10px] font-mono uppercase text-white/40 block">Protein Adherence</span>
          <span className="text-sm font-bold font-mono text-emerald-400">{proPercent}%</span>
        </div>
      </div>

      {/* 4. TODAY'S MEAL LOGS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#ededed]">Today's Meal Breakdown</h2>
          <span className="text-xs font-mono text-white/40">
            {todayFoodEntries.length} total logged items
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MealCard
            mealType="breakfast"
            title="Breakfast"
            items={breakfastItems}
            onAddFood={onOpenFoodLogger}
            onDeleteItem={deleteFoodItem}
          />
          <MealCard
            mealType="lunch"
            title="Lunch"
            items={lunchItems}
            onAddFood={onOpenFoodLogger}
            onDeleteItem={deleteFoodItem}
          />
          <MealCard
            mealType="dinner"
            title="Dinner"
            items={dinnerItems}
            onAddFood={onOpenFoodLogger}
            onDeleteItem={deleteFoodItem}
          />
          <MealCard
            mealType="snack"
            title="Snacks & Extras"
            items={snackItems}
            onAddFood={onOpenFoodLogger}
            onDeleteItem={deleteFoodItem}
          />
        </div>
      </div>

      {/* 5. HYDRATION TRACKER BAR */}
      <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#ededed]">Daily Hydration Log</h3>
              <p className="text-[11px] text-white/40">Target: {userProfile.dailyTargets.waterMl} ml / day</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-mono text-cyan-400">{todayWaterMl} ml</span>
            <span className="text-xs font-mono text-white/40">
              ({Math.round((todayWaterMl / userProfile.dailyTargets.waterMl) * 100)}%)
            </span>
          </div>
        </div>

        <ProgressBar
          value={todayWaterMl}
          max={userProfile.dailyTargets.waterMl}
          color="cyan"
          size="md"
        />

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => logWater(250)}
            className="px-3 py-1.5 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] hover:bg-cyan-500/10 hover:text-cyan-300 text-xs font-mono text-white/70 transition-all"
          >
            + 250 ml (Glass)
          </button>
          <button
            onClick={() => logWater(500)}
            className="px-3 py-1.5 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] hover:bg-cyan-500/10 hover:text-cyan-300 text-xs font-mono text-white/70 transition-all"
          >
            + 500 ml (Bottle)
          </button>
          <button
            onClick={() => logWater(750)}
            className="px-3 py-1.5 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] hover:bg-cyan-500/10 hover:text-cyan-300 text-xs font-mono text-white/70 transition-all"
          >
            + 750 ml (Shaker)
          </button>
          <button
            onClick={() => logWater(-250)}
            className="px-3 py-1.5 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] hover:bg-rose-500/10 hover:text-rose-300 text-xs font-mono text-white/40 transition-all ml-auto"
          >
            - 250 ml
          </button>
        </div>
      </div>
    </div>
  );
};
