import React from "react";
import {
  Sparkles,
  Dumbbell,
  Utensils,
  ArrowRight,
  CheckCircle2,
  Circle,
  Flame,
  Droplets,
  Footprints,
  TrendingUp,
  Target,
  Plus,
  Zap,
  Calendar,
  Award,
  Calculator,
  Layers,
  ChevronRight,
} from "lucide-react";
import { useFitness } from "../context/FitnessContext";
import { MetricCard } from "../components/common/MetricCard";
import { MacroCard } from "../components/common/MacroCard";
import { MealCard } from "../components/nutrition/MealCard";

interface HomeViewProps {
  onOpenFoodLogger: (mealType?: any) => void;
  onOpenGoals: () => void;
  onOpenWeeklyReview: () => void;
  onOpenStrengthTools?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenFoodLogger,
  onOpenGoals,
  onOpenWeeklyReview,
  onOpenStrengthTools,
}) => {
  const {
    userProfile,
    nextBestAction,
    dailyFocus,
    toggleFocusItem,
    todayTotals,
    remainingMacros,
    todayWorkout,
    todayWorkoutScheduledName,
    isTodayWorkoutCompleted,
    startWorkout,
    activeWorkout,
    todayFoodEntries,
    deleteFoodItem,
    addFoodItem,
    todayWaterMl,
    logWater,
    logSteps,
    weeklyWorkoutConsistency,
    weightTrendStats,
    progressiveOverloadAdvice,
    setActiveTab,
  } = useFitness();

  const handleNextActionClick = () => {
    if (nextBestAction.actionType === "start_workout") {
      startWorkout();
    } else if (nextBestAction.actionType === "log_protein") {
      onOpenFoodLogger("dinner");
    } else if (nextBestAction.actionType === "active_walk") {
      logSteps(todayTotals.steps + 2000);
    } else if (nextBestAction.actionType === "weekly_review") {
      onOpenWeeklyReview();
    }
  };

  const handleFocusItemAction = (item: any) => {
    if (item.actionType === "workout") {
      startWorkout();
    } else if (item.actionType === "nutrition") {
      onOpenFoodLogger("lunch");
    } else if (item.actionType === "activity") {
      logSteps(todayTotals.steps + 2000);
    } else {
      toggleFocusItem(item.id);
    }
  };

  // Quick Macro Fast Adds
  const handleFastAddStaple = (name: string, cal: number, p: number, c: number, f: number, meal: any = "snack") => {
    addFoodItem({
      name,
      mealType: meal,
      calories: cal,
      protein: p,
      carbs: c,
      fat: f,
      servingSize: "1 serving",
    });
  };

  // Group food items by meal
  const breakfastItems = todayFoodEntries.filter((f) => f.mealType === "breakfast");
  const lunchItems = todayFoodEntries.filter((f) => f.mealType === "lunch");
  const dinnerItems = todayFoodEntries.filter((f) => f.mealType === "dinner");
  const snackItems = todayFoodEntries.filter((f) => f.mealType === "snack" || f.mealType === "drink");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* 1. ATHLETIC READINESS & SESSION DIRECTOR */}
      <section className="relative overflow-hidden rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f] p-5 sm:p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold tracking-wider uppercase">
                SESSION DIRECTOR
              </span>
              <span className="text-[10px] font-mono text-white/40">
                Split: <strong className="text-white/80">{todayWorkoutScheduledName}</strong>
              </span>
              <span className="text-[10px] font-mono text-white/40">
                Target: <strong className="text-emerald-400">{userProfile.dailyTargets.calories} kcal</strong> / <strong className="text-blue-400">{userProfile.dailyTargets.protein}g protein</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#ededed] leading-tight">
              {nextBestAction.title}
            </h1>

            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              {nextBestAction.subtitle} <span className="text-white/40 font-mono">({nextBestAction.reason})</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenStrengthTools && (
              <button
                onClick={onOpenStrengthTools}
                className="px-3.5 py-2.5 rounded-xl bg-[#0f0f0f] hover:bg-[#161616] border border-[#1f1f1f] text-xs text-white/80 font-medium transition-all flex items-center gap-1.5"
                title="Barbell Plate Math & 1RM"
              >
                <Calculator className="w-3.5 h-3.5 text-blue-400" />
                <span>Strength Tools</span>
              </button>
            )}

            <button
              onClick={handleNextActionClick}
              id="btn-hero-action"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <span>{nextBestAction.actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. DAILY PROTOCOL CHECKLIST + TRAINING SESSION SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Daily Protocol Checklist (7 cols) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#ededed] flex items-center gap-2">
                  <span>Daily Adherence Protocol</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-white/50 border border-[#1a1a1a]">
                    {dailyFocus.filter((f) => f.completed).length} / {dailyFocus.length} Completed
                  </span>
                </h2>
                <p className="text-xs text-white/40">Real-time target checkpoints for nutrition, training & recovery</p>
              </div>

              <button
                onClick={() => setActiveTab("coach")}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>Coach Advice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {dailyFocus.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    item.completed
                      ? "bg-[#0c0c0c] border-[#161616] opacity-60"
                      : "bg-[#0f0f0f] border-[#1a1a1a] hover:border-[#2e2e2e]"
                  }`}
                >
                  <div
                    onClick={() => toggleFocusItem(item.id)}
                    className="flex items-start gap-3 cursor-pointer select-none flex-1"
                  >
                    <button
                      type="button"
                      className={`mt-0.5 transition-colors ${
                        item.completed ? "text-emerald-400" : "text-white/30 hover:text-white/70"
                      }`}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <p
                        className={`text-xs font-medium ${
                          item.completed ? "text-white/50 line-through" : "text-[#ededed]"
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-[11px] text-white/40 mt-0.5">{item.why}</p>
                    </div>
                  </div>

                  {item.actionLabel && !item.completed && (
                    <button
                      onClick={() => handleFocusItemAction(item)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white text-[11px] font-mono transition-all shrink-0 border border-[#1a1a1a]"
                    >
                      {item.actionLabel}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Progressive Overload Insight Box */}
          {progressiveOverloadAdvice.length > 0 && (
            <div className="p-4 rounded-xl bg-[#0a0a0a] border border-blue-500/20 flex items-start gap-3">
              <Zap className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-blue-300">
                    Progression Protocol: {progressiveOverloadAdvice[0].exerciseName}
                  </p>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    OVERLOAD KEY
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  {progressiveOverloadAdvice[0].recommendation}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Training & Habits Snapshot (5 cols) */}
        <section className="lg:col-span-5 space-y-4">
          {/* Today's Workout Card */}
          <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-[#ededed]">Training Session</h3>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isTodayWorkoutCompleted
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : activeWorkout
                    ? "bg-blue-500/20 text-blue-300 animate-pulse border border-blue-500/30"
                    : "bg-[#0f0f0f] text-white/50 border border-[#1a1a1a]"
                }`}
              >
                {isTodayWorkoutCompleted
                  ? "COMPLETED"
                  : activeWorkout
                  ? "IN PROGRESS"
                  : "SCHEDULED"}
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-[#ededed]">{todayWorkoutScheduledName}</h4>
              <p className="text-xs text-white/40 font-mono mt-0.5">
                Target: 4-5 movements · Strength & Hypertrophy Periodization
              </p>
            </div>

            <div className="pt-2 border-t border-[#1a1a1a] flex items-center justify-between">
              <div className="text-xs font-mono text-white/50">
                Weekly Volume: {weeklyWorkoutConsistency.completed} / {weeklyWorkoutConsistency.target} Sessions
              </div>

              {activeWorkout ? (
                <button
                  onClick={() => startWorkout()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20"
                >
                  Resume Session
                </button>
              ) : isTodayWorkoutCompleted ? (
                <button
                  onClick={() => startWorkout()}
                  className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/80 text-xs font-medium border border-[#1a1a1a]"
                >
                  Log Extra Session
                </button>
              ) : (
                <button
                  onClick={() => startWorkout()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Start Session</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Habits: Steps + Hydration */}
          <div className="grid grid-cols-2 gap-3">
            {/* Water */}
            <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <Droplets className="w-3.5 h-3.5" />
                  <span className="font-mono text-[10px] uppercase">Hydration</span>
                </div>
                <span className="font-mono text-white/40 text-[10px]">
                  {userProfile.dailyTargets.waterMl}ml
                </span>
              </div>
              <p className="text-lg font-bold font-mono text-[#ededed]">{todayWaterMl} ml</p>
              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={() => logWater(250)}
                  className="flex-1 py-1 rounded bg-[#0f0f0f] border border-[#1a1a1a] hover:bg-cyan-500/10 hover:text-cyan-300 text-white/60 text-[10px] font-mono transition-colors"
                >
                  +250ml
                </button>
                <button
                  onClick={() => logWater(500)}
                  className="flex-1 py-1 rounded bg-[#0f0f0f] border border-[#1a1a1a] hover:bg-cyan-500/10 hover:text-cyan-300 text-white/60 text-[10px] font-mono transition-colors"
                >
                  +500ml
                </button>
              </div>
            </div>

            {/* Steps */}
            <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Footprints className="w-3.5 h-3.5" />
                  <span className="font-mono text-[10px] uppercase">Activity</span>
                </div>
                <span className="font-mono text-white/40 text-[10px]">
                  {userProfile.dailyTargets.steps.toLocaleString()}
                </span>
              </div>
              <p className="text-lg font-bold font-mono text-[#ededed]">
                {todayTotals.steps.toLocaleString()}
              </p>
              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={() => logSteps(todayTotals.steps + 1000)}
                  className="w-full py-1 rounded bg-[#0f0f0f] border border-[#1a1a1a] hover:bg-emerald-500/10 hover:text-emerald-300 text-white/60 text-[10px] font-mono transition-colors"
                >
                  +1,000 Steps
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 3. NUTRITION & MACRO TARGETS ROW */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#ededed]">Macronutrient Energy Balance</h2>
            <p className="text-xs text-white/40 font-mono">
              {todayTotals.calories} kcal consumed · {remainingMacros.calories} kcal remaining budget
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenFoodLogger("lunch")}
              id="btn-home-log-food"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-300 border border-emerald-500/20 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Natural Language Food Log</span>
            </button>
          </div>
        </div>

        {/* 1-Tap Quick Staples Toolbar */}
        <div className="p-3 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-mono uppercase text-white/40 shrink-0 mr-1">
            Fast Add:
          </span>
          <button
            onClick={() => handleFastAddStaple("Whey Protein Shake", 130, 25, 3, 1.5, "snack")}
            className="px-2.5 py-1 rounded-lg bg-[#0f0f0f] hover:bg-blue-600/20 hover:text-blue-300 hover:border-blue-500/30 border border-[#1a1a1a] text-white/70 text-[11px] font-mono transition-all shrink-0"
          >
            + Whey Shake (25g P)
          </button>
          <button
            onClick={() => handleFastAddStaple("2 Boiled Eggs", 140, 12, 1, 10, "breakfast")}
            className="px-2.5 py-1 rounded-lg bg-[#0f0f0f] hover:bg-emerald-600/20 hover:text-emerald-300 hover:border-emerald-500/30 border border-[#1a1a1a] text-white/70 text-[11px] font-mono transition-all shrink-0"
          >
            + 2 Eggs (12g P)
          </button>
          <button
            onClick={() => handleFastAddStaple("200g Grilled Chicken Breast", 220, 46, 0, 4, "lunch")}
            className="px-2.5 py-1 rounded-lg bg-[#0f0f0f] hover:bg-emerald-600/20 hover:text-emerald-300 hover:border-emerald-500/30 border border-[#1a1a1a] text-white/70 text-[11px] font-mono transition-all shrink-0"
          >
            + 200g Chicken (46g P)
          </button>
          <button
            onClick={() => handleFastAddStaple("1 Cup Greek Yogurt (0% Fat)", 130, 22, 8, 0, "snack")}
            className="px-2.5 py-1 rounded-lg bg-[#0f0f0f] hover:bg-blue-600/20 hover:text-blue-300 hover:border-blue-500/30 border border-[#1a1a1a] text-white/70 text-[11px] font-mono transition-all shrink-0"
          >
            + Greek Yogurt (22g P)
          </button>
          <button
            onClick={() => handleFastAddStaple("1 Medium Banana", 105, 1.3, 27, 0.3, "snack")}
            className="px-2.5 py-1 rounded-lg bg-[#0f0f0f] hover:bg-amber-600/20 hover:text-amber-300 hover:border-amber-500/30 border border-[#1a1a1a] text-white/70 text-[11px] font-mono transition-all shrink-0"
          >
            + Banana (27g C)
          </button>
        </div>

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
      </section>

      {/* 4. TODAY'S MEAL LOGS BREAKDOWN */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-white/40">Today's Meal Records</h3>
          <span className="text-xs font-mono text-white/40">
            {todayFoodEntries.length} items logged
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
            title="Snacks & Supplements"
            items={snackItems}
            onAddFood={onOpenFoodLogger}
            onDeleteItem={deleteFoodItem}
          />
        </div>
      </section>
    </div>
  );
};
