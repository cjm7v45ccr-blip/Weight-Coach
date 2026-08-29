import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Dumbbell,
  Sparkles,
  Utensils,
  Flame,
  Droplets,
  Footprints,
  Activity,
  CheckCircle2,
  Calendar,
  Zap,
  Camera,
  Play,
  ArrowRight,
  Check,
  ShieldCheck,
  Award,
} from "lucide-react";
import { useFitness } from "../context/FitnessContext";
import { MealCard } from "../components/nutrition/MealCard";

interface HomeViewProps {
  onOpenFoodLogger: (mealType?: any, tab?: "camera" | "ai_parser" | "search" | "manual") => void;
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
    todayTotals,
    remainingMacros,
    todayWorkoutScheduledName,
    isTodayWorkoutCompleted,
    startWorkout,
    startEmptyWorkout,
    activeWorkout,
    todayFoodEntries,
    deleteFoodItem,
    addFoodItem,
    todayWaterMl,
    logWater,
    logSteps,
    setActiveTab,
    dailyFocus,
    toggleFocusItem,
    nextBestAction,
    personalRecords,
    progressiveOverloadAdvice,
  } = useFitness();

  // Sub-tabs
  const [subTab, setSubTab] = useState<"dashboard" | "charts" | "report" | "snapshots">("dashboard");

  // Date offset simulation (for navigating between days)
  const [dateOffset, setDateOffset] = useState<number>(0);

  // Accordion open/close states
  const [isMacrosOpen, setIsMacrosOpen] = useState<boolean>(true);
  const [isHighlightedOpen, setIsHighlightedOpen] = useState<boolean>(true);
  const [isScoresOpen, setIsScoresOpen] = useState<boolean>(true);
  const [isEnergyOpen, setIsEnergyOpen] = useState<boolean>(true);

  // Formatted date
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + dateOffset);
  const dateLabel =
    dateOffset === 0
      ? `Today, ${currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
      : currentDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  // Targets
  const targetCal = userProfile.dailyTargets?.calories || 2573;
  const targetP = userProfile.dailyTargets?.protein || 160;
  const targetC = userProfile.dailyTargets?.carbs || 290;
  const targetF = userProfile.dailyTargets?.fat || 86;

  // Consumed
  const consumedCal = todayTotals.calories || 0;
  const consumedP = todayTotals.protein || 0;
  const consumedC = todayTotals.carbs || 0;
  const consumedF = todayTotals.fat || 0;

  // Percentages
  const pPercent = Math.min(100, Math.round((consumedP / (targetP || 1)) * 100));
  const cPercent = Math.min(100, Math.round((consumedC / (targetC || 1)) * 100));
  const fPercent = Math.min(100, Math.round((consumedF / (targetF || 1)) * 100));
  const calPercent = Math.min(100, Math.round((consumedCal / (targetCal || 1)) * 100));

  // Burned & BMR
  const bmr = userProfile.bmr || 1750;
  const exerciseBurn = 420;
  const totalBurned = bmr + exerciseBurn;

  // Meals grouping
  const breakfastItems = todayFoodEntries.filter((f) => f.mealType === "breakfast");
  const lunchItems = todayFoodEntries.filter((f) => f.mealType === "lunch");
  const dinnerItems = todayFoodEntries.filter((f) => f.mealType === "dinner");
  const snackItems = todayFoodEntries.filter((f) => f.mealType === "snack" || f.mealType === "drink");

  // Quick log helper
  const handleQuickLogProtein = () => {
    addFoodItem({
      name: "Quick Protein Boost (Whey)",
      servingSize: "1 scoop (30g)",
      calories: 120,
      protein: 24,
      carbs: 2,
      fat: 1.5,
      mealType: "snack",
      micros: { calcium: 150, sodium: 70 },
    });
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-20">
      {/* 1. Sub-Tab Pill Bar & Quick Action Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-x-auto py-1">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-full text-xs font-semibold shrink-0">
          <button
            onClick={() => setSubTab("dashboard")}
            className={`px-4 py-1.5 rounded-full transition-all ${
              subTab === "dashboard" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setSubTab("charts");
              setActiveTab("progress");
            }}
            className={`px-4 py-1.5 rounded-full transition-all ${
              subTab === "charts" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Charts & Trends
          </button>
          <button
            onClick={() => {
              setSubTab("report");
              onOpenWeeklyReview();
            }}
            className={`px-4 py-1.5 rounded-full transition-all ${
              subTab === "report" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Weekly Report
          </button>
          <button
            onClick={() => onOpenGoals()}
            className={`px-4 py-1.5 rounded-full transition-all ${
              subTab === "snapshots" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Targets
          </button>
        </div>

        {/* Action shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenFoodLogger("lunch", "camera")}
            id="btn-scan-meal-hero"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 text-xs font-bold shadow-xs transition-all"
          >
            <Camera className="w-4 h-4 text-gray-900" />
            <span>AI Camera</span>
          </button>
          <button
            onClick={() => onOpenFoodLogger("lunch", "ai_parser")}
            id="btn-quick-log-hero"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Log</span>
          </button>
        </div>
      </div>

      {/* 2. AI Next Best Action & Focus Checklist */}
      <div className="crono-card p-5 sm:p-6 bg-gradient-to-br from-white to-gray-50/80 border border-gray-200/80 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                AI Next Best Action
              </span>
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                {nextBestAction?.title || "Optimize your daily nutrition & volume"}
              </h2>
            </div>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
            {nextBestAction?.priority || "High Priority"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-gray-100">
          <div className="text-xs text-gray-600 space-y-0.5">
            <p className="font-medium text-gray-900">{nextBestAction?.subtitle}</p>
            <p className="text-[11px] text-gray-500">{nextBestAction?.reason}</p>
          </div>

          <button
            onClick={() => {
              if (nextBestAction?.actionType === "start_workout") {
                startWorkout();
              } else if (nextBestAction?.actionType === "log_weight") {
                setActiveTab("progress");
              } else if (nextBestAction?.actionType === "weekly_review") {
                onOpenWeeklyReview();
              } else {
                onOpenFoodLogger("lunch", "ai_parser");
              }
            }}
            id="btn-next-best-action-trigger"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-all shrink-0"
          >
            <span>{nextBestAction?.actionLabel || "TAKE ACTION"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Daily Focus Items Pill Bar */}
        {dailyFocus && dailyFocus.length > 0 && (
          <div className="pt-2 border-t border-gray-100/80">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Today's Focus Checklist</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dailyFocus.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleFocusItem(item.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                    item.completed
                      ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-900"
                      : "bg-white border-gray-200 hover:border-gray-300 text-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                        item.completed ? "bg-emerald-600 text-white" : "border border-gray-300 bg-white"
                      }`}
                    >
                      {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className={`text-xs font-medium truncate ${item.completed ? "line-through text-gray-500" : ""}`}>
                      {item.title}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Date Navigation Bar */}
      <div className="crono-card px-4 py-3 flex items-center justify-between border border-gray-200/80">
        <button
          onClick={() => setDateOffset((prev) => prev - 1)}
          className="p-1.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-5 h-5 text-gray-900" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-900" />
          <span className="font-bold text-base text-gray-900 tracking-tight">{dateLabel}</span>
          {dateOffset !== 0 && (
            <button
              onClick={() => setDateOffset(0)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline ml-1"
            >
              Today
            </button>
          )}
        </div>

        <button
          onClick={() => setDateOffset((prev) => prev + 1)}
          className="p-1.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Next day"
        >
          <ChevronRight className="w-5 h-5 text-gray-900" />
        </button>
      </div>

      {/* 4. Scheduled Workout Hero Card */}
      <div className="crono-card p-5 border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Scheduled Session
              </span>
              {isTodayWorkoutCompleted && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-gray-900 mt-1">
              {todayWorkoutScheduledName || "Upper Body Strength & Hypertrophy"}
            </h3>
            <p className="text-xs text-gray-500">
              {isTodayWorkoutCompleted
                ? "You crushed today's scheduled lifting session. Keep recovery on point!"
                : "Target 4-5 compound lifts with progressive overload."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("workout")}
            className="px-3.5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-semibold transition-all"
          >
            View Routine
          </button>
          <button
            onClick={() => (activeWorkout ? startWorkout() : startEmptyWorkout())}
            id="btn-home-start-workout"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{activeWorkout ? "Resume Session" : "Start Workout"}</span>
          </button>
        </div>
      </div>

      {/* 5. CARD 1: Macronutrient Targets with Quick-Log Actions */}
      <div className="crono-card overflow-hidden border border-gray-200/80">
        <div
          onClick={() => setIsMacrosOpen(!isMacrosOpen)}
          className="px-5 py-4 flex items-center justify-between cursor-pointer border-b border-gray-100 select-none hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
              Macronutrient Targets
            </h2>
            <span className="text-[11px] text-gray-500 font-medium">
              ({remainingMacros.calories} kcal remaining)
            </span>
          </div>
          <button className="text-gray-500 hover:text-gray-900">
            {isMacrosOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {isMacrosOpen && (
          <div className="p-5 space-y-4">
            {/* Quick Macro Increment Buttons */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-gray-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Quick Log:</span>
              <button
                onClick={handleQuickLogProtein}
                className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
              >
                +24g Protein (Whey)
              </button>
              <button
                onClick={() => logWater(250)}
                className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition-colors"
              >
                +250ml Water
              </button>
              <button
                onClick={() => logSteps(todayTotals.steps + 1000)}
                className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors"
              >
                +1,000 Steps
              </button>
            </div>

            {/* Energy Row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-gray-900">
                  Energy <span className="font-normal text-gray-500">- {consumedCal.toFixed(0)} / {targetCal.toFixed(0)} kcal</span>
                </span>
                <span className="font-bold text-gray-900">{calPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${calPercent}%` }}
                />
              </div>
            </div>

            {/* Protein Row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-gray-900">
                  Protein <span className="font-normal text-gray-500">- {consumedP.toFixed(1)} / {targetP.toFixed(0)} g</span>
                </span>
                <span className="font-bold text-gray-900">{pPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${pPercent}%` }}
                />
              </div>
            </div>

            {/* Net Carbs Row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-gray-900">
                  Net Carbs <span className="font-normal text-gray-500">- {consumedC.toFixed(1)} / {targetC.toFixed(0)} g</span>
                </span>
                <span className="font-bold text-gray-900">{cPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${cPercent}%` }}
                />
              </div>
            </div>

            {/* Fat Row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-gray-900">
                  Fat <span className="font-normal text-gray-500">- {consumedF.toFixed(1)} / {targetF.toFixed(0)} g</span>
                </span>
                <span className="font-bold text-gray-900">{fPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${fPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. CARD 2: Highlighted Targets */}
      <div className="crono-card overflow-hidden border border-gray-200/80">
        <div
          onClick={() => setIsHighlightedOpen(!isHighlightedOpen)}
          className="px-5 py-4 flex items-center justify-between cursor-pointer border-b border-gray-100 select-none hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
            Highlighted Targets
          </h2>
          <button className="text-gray-500 hover:text-gray-900">
            {isHighlightedOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {isHighlightedOpen && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {/* Left Col 1: Fiber */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900">Fiber</span>
                <span className="font-bold text-gray-900">142%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            {/* Right Col 1: Fat */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900">Fat</span>
                <span className="font-bold text-gray-900">71%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: "71%" }} />
              </div>
            </div>

            {/* Left Col 2: Vitamin C */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900">Vitamin C</span>
                <span className="font-bold text-gray-900">101%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            {/* Right Col 2: Vitamin A */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900">Vitamin A</span>
                <span className="font-bold text-gray-900">74%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: "74%" }} />
              </div>
            </div>

            {/* Left Col 3: B12 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900">B12 (Cobalamin)</span>
                <span className="font-bold text-gray-900">200%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            {/* Right Col 3: Potassium */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900">Potassium</span>
                <span className="font-bold text-gray-900">127%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            {/* Left Col 4: Calcium */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900">Calcium</span>
                <span className="font-bold text-gray-900">110%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            {/* Right Col 4: Added Sugars */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900">Added Sugars</span>
                <span className="text-[11px] font-bold text-gray-500">Low (Safe)</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "35%" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. CARD 3: Nutrition Scores */}
      <div className="crono-card overflow-hidden border border-gray-200/80">
        <div
          onClick={() => setIsScoresOpen(!isScoresOpen)}
          className="px-5 py-4 flex items-center justify-between cursor-pointer border-b border-gray-100 select-none hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
              Nutrition Scores
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Gold Tier
            </span>
          </div>
          <button className="text-gray-500 hover:text-gray-900">
            {isScoresOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {isScoresOpen && (
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-center space-y-1">
              <span className="text-[11px] font-medium text-gray-500">All Targets</span>
              <p className="text-xl font-bold text-blue-600">90%</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: "90%" }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-center space-y-1">
              <span className="text-[11px] font-medium text-gray-500">Immune Support</span>
              <p className="text-xl font-bold text-amber-500">79%</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: "79%" }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-center space-y-1">
              <span className="text-[11px] font-medium text-gray-500">Antioxidants</span>
              <p className="text-xl font-bold text-emerald-600">94%</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: "94%" }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-center space-y-1">
              <span className="text-[11px] font-medium text-gray-500">Bone Health</span>
              <p className="text-xl font-bold text-amber-500">88%</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: "88%" }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-center space-y-1">
              <span className="text-[11px] font-medium text-gray-500">Heart Health</span>
              <p className="text-xl font-bold text-blue-600">85%</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: "85%" }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-center space-y-1">
              <span className="text-[11px] font-medium text-gray-500">Metabolism</span>
              <p className="text-xl font-bold text-purple-600">92%</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: "92%" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 8. CARD 4: Energy Burned vs Consumed */}
      <div className="crono-card overflow-hidden border border-gray-200/80">
        <div
          onClick={() => setIsEnergyOpen(!isEnergyOpen)}
          className="px-5 py-4 flex items-center justify-between cursor-pointer border-b border-gray-100 select-none hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
              Energy & Hydration Summary
            </h2>
          </div>
          <button className="text-gray-500 hover:text-gray-900">
            {isEnergyOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {isEnergyOpen && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Energy Consumed</span>
                <span className="font-semibold">{calPercent}%</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{consumedCal} <span className="text-xs font-normal text-gray-500">/ {targetCal} kcal</span></p>
              <p className="text-[11px] text-blue-600 font-medium">{remainingMacros.calories} kcal remaining</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Energy Burned</span>
                <Activity className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-xl font-bold text-gray-900">{totalBurned} <span className="text-xs font-normal text-gray-500">kcal</span></p>
              <p className="text-[11px] text-gray-500">BMR: {bmr} kcal + Active: {exerciseBurn} kcal</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Hydration & Steps</span>
                <Droplets className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">{(todayWaterMl / 1000).toFixed(1)} / 3.0 L</span>
                <button
                  onClick={() => logWater(250)}
                  className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 hover:bg-sky-200 text-[10px] font-bold"
                >
                  +250ml
                </button>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                  <Footprints className="w-3.5 h-3.5 text-gray-700" /> {todayTotals.steps.toLocaleString()} steps
                </span>
                <button
                  onClick={() => logSteps(todayTotals.steps + 1000)}
                  className="px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-900 hover:bg-gray-300 text-[10px] font-bold"
                >
                  +1,000
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 9. Daily Diary & Training Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-gray-900">Today's Food Diary</h2>
          <button
            onClick={() => setActiveTab("nutrition")}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>View Full Diary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MealCard
            mealType="breakfast"
            items={breakfastItems}
            onAddItem={() => onOpenFoodLogger("breakfast")}
            onDeleteItem={deleteFoodItem}
          />
          <MealCard
            mealType="lunch"
            items={lunchItems}
            onAddItem={() => onOpenFoodLogger("lunch")}
            onDeleteItem={deleteFoodItem}
          />
          <MealCard
            mealType="dinner"
            items={dinnerItems}
            onAddItem={() => onOpenFoodLogger("dinner")}
            onDeleteItem={deleteFoodItem}
          />
          <MealCard
            mealType="snack"
            items={snackItems}
            onAddItem={() => onOpenFoodLogger("snack")}
            onDeleteItem={deleteFoodItem}
          />
        </div>
      </div>
    </div>
  );
};
