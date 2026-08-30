import React, { useState, useMemo } from "react";
import {
  UtensilsCrossed,
  Plus,
  Flame,
  Droplets,
  CheckCircle2,
  Calendar,
  Camera,
  Sparkles,
  Search,
  Barcode,
  RotateCcw,
  Zap,
  Info,
} from "lucide-react";
import { useFitness } from "../context/FitnessContext";
import { MealCard } from "../components/nutrition/MealCard";
import { CronometerCalorieSummary } from "../components/nutrition/CronometerCalorieSummary";
import { CronometerMicros } from "../components/nutrition/CronometerMicros";
import { MealType } from "../types";

interface NutritionViewProps {
  onOpenFoodLogger: (mealType?: MealType, tab?: "camera" | "ai_parser" | "search" | "manual") => void;
}

export const NutritionView: React.FC<NutritionViewProps> = ({ onOpenFoodLogger }) => {
  const {
    userProfile,
    todayTotals,
    remainingMacros,
    todayFoodEntries,
    foodEntries,
    deleteFoodItem,
    todayWaterMl,
    logWater,
  } = useFitness();

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(6); // 6 = Today

  const breakfastItems = todayFoodEntries.filter((f) => f.mealType === "breakfast");
  const lunchItems = todayFoodEntries.filter((f) => f.mealType === "lunch");
  const dinnerItems = todayFoodEntries.filter((f) => f.mealType === "dinner");
  const snackItems = todayFoodEntries.filter((f) => f.mealType === "snack" || f.mealType === "drink");

  const targetCal = userProfile.dailyTargets?.calories || 2573;
  const targetP = userProfile.dailyTargets?.protein || 160;

  // Real 7-day history computed dynamically from user's actual food entries
  const daysOfWeek = useMemo(() => {
    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = i === 0 ? "Today" : dayNames[d.getDay()];

      // Filter entries for this day
      const dayEntries = foodEntries.filter((entry) => entry.timestamp && entry.timestamp.startsWith(dateStr));
      const dayCal = dayEntries.reduce((acc, curr) => acc + (Number(curr.calories) || 0), 0);
      const dayProtein = dayEntries.reduce((acc, curr) => acc + (Number(curr.protein) || 0), 0);

      let status: "hit" | "over" | "under" | "current" = "hit";
      if (i === 0) {
        status = "current";
      } else if (dayEntries.length === 0) {
        status = "under";
      } else if (dayCal > targetCal + 150) {
        status = "over";
      } else if (dayCal < targetCal - 250) {
        status = "under";
      }

      days.push({
        day: dayName,
        date: dateStr,
        cal: Math.round(dayCal),
        protein: Math.round(dayProtein),
        status,
        entryCount: dayEntries.length,
      });
    }
    return days;
  }, [foodEntries, targetCal]);

  const daysOnTargetCount = daysOfWeek.filter((d) => d.entryCount > 0 && d.cal > 0).length;

  const waterGoalMl = 3000;
  const waterPercent = Math.min(100, Math.round((todayWaterMl / waterGoalMl) * 100));

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* 1. Header Hero Banner */}
      <div className="crono-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200/80 bg-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Daily Food Diary & Micros</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Nutrition & Biomarkers
          </h1>
          <p className="text-xs text-gray-500">
            Track macronutrient pacing, caloric balance, and 14+ essential vitamins & electrolytes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenFoodLogger("lunch", "camera")}
            id="btn-nutrition-ai-camera"
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 text-xs font-bold shadow-xs transition-all"
          >
            <Camera className="w-4 h-4 text-gray-900" />
            <span>AI Camera</span>
          </button>
          <button
            onClick={() => onOpenFoodLogger("lunch", "ai_parser")}
            id="btn-nutrition-ai-voice"
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 text-xs font-bold shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI Parser</span>
          </button>
          <button
            onClick={() => onOpenFoodLogger("lunch", "search")}
            id="btn-nutrition-add-food"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Food</span>
          </button>
        </div>
      </div>

      {/* 2. 7-Day Macro Adherence Ribbon */}
      <div className="crono-card p-4 border border-gray-200/80 bg-white">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-900">7-Day Macro Consistency</span>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            {daysOnTargetCount > 0 ? `${daysOnTargetCount}/7 Active Days` : "Log Meals to Track Adherence"}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map((d, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <button
                key={d.day}
                onClick={() => setSelectedDayIndex(idx)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? "bg-gray-900 text-white border-gray-900 shadow-xs scale-[1.02]"
                    : "bg-gray-50/80 hover:bg-gray-100 text-gray-800 border-gray-200/70"
                }`}
              >
                <p className={`text-[10px] font-bold uppercase ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
                  {d.day}
                </p>
                <p className={`text-xs font-bold mt-0.5 ${isSelected ? "text-white" : "text-gray-900"}`}>
                  {d.cal}
                </p>
                <span
                  className={`inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded-full mt-1 ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : d.status === "hit" || d.status === "current"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {d.protein}g P
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Energy & Macro Summary Card */}
      <CronometerCalorieSummary
        consumed={todayTotals.calories}
        burned={420}
        bmr={userProfile.bmr || 1780}
        targetBudget={targetCal}
        proteinGrams={todayTotals.protein}
        carbsGrams={todayTotals.carbs}
        fatGrams={todayTotals.fat}
      />

      {/* 4. Meal Diary Groupings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-gray-900" />
            <h2 className="text-base font-bold text-gray-900">Meal Groups</h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {todayFoodEntries.length} logged items today
          </span>
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

      {/* 5. Full Micronutrient Tracking */}
      <CronometerMicros foodEntries={todayFoodEntries} />

      {/* 6. Hydration Card */}
      <div className="crono-card p-5 sm:p-6 border border-gray-200/80 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Daily Hydration Tracker</h3>
              <p className="text-xs text-gray-500">
                Logged: <strong className="text-gray-900">{(todayWaterMl / 1000).toFixed(2)} L</strong> of { (waterGoalMl / 1000).toFixed(1) } L goal ({waterPercent}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => logWater(250)}
              className="px-3.5 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-all"
            >
              +250 ml (Glass)
            </button>
            <button
              onClick={() => logWater(500)}
              className="px-3.5 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-all"
            >
              +500 ml (Bottle)
            </button>
            <button
              onClick={() => logWater(1000)}
              className="px-3.5 py-1.5 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-bold transition-all"
            >
              +1,000 ml
            </button>
          </div>
        </div>

        {/* Water Progress Bar */}
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-sky-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${waterPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
