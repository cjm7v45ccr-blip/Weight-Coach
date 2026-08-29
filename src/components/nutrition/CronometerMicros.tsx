import React, { useState } from "react";
import { ChevronDown, ChevronUp, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { MicronutrientInfo } from "../../types";

interface CronometerMicrosProps {
  foodEntries: Array<{
    micros?: MicronutrientInfo;
  }>;
}

interface NutrientTarget {
  key: keyof MicronutrientInfo;
  label: string;
  category: "General" | "Vitamins" | "Minerals" | "Carbohydrates" | "Lipids";
  target: number;
  unit: string;
  warningLimit?: number;
}

const DEFAULT_TARGETS: NutrientTarget[] = [
  // General & Fiber
  { key: "fiber", label: "Fiber", category: "Carbohydrates", target: 38, unit: "g" },
  { key: "sugar", label: "Sugars", category: "Carbohydrates", target: 50, unit: "g", warningLimit: 75 },
  { key: "saturatedFat", label: "Saturated Fat", category: "Lipids", target: 20, unit: "g", warningLimit: 25 },
  { key: "cholesterol", label: "Cholesterol", category: "Lipids", target: 300, unit: "mg" },

  // Minerals
  { key: "sodium", label: "Sodium", category: "Minerals", target: 2300, unit: "mg", warningLimit: 3000 },
  { key: "potassium", label: "Potassium", category: "Minerals", target: 4700, unit: "mg" },
  { key: "calcium", label: "Calcium", category: "Minerals", target: 1000, unit: "mg" },
  { key: "iron", label: "Iron", category: "Minerals", target: 18, unit: "mg" },
  { key: "magnesium", label: "Magnesium", category: "Minerals", target: 400, unit: "mg" },
  { key: "zinc", label: "Zinc", category: "Minerals", target: 11, unit: "mg" },

  // Vitamins
  { key: "vitaminA", label: "Vitamin A", category: "Vitamins", target: 900, unit: "mcg" },
  { key: "vitaminC", label: "Vitamin C", category: "Vitamins", target: 90, unit: "mg" },
  { key: "vitaminD", label: "Vitamin D", category: "Vitamins", target: 20, unit: "mcg" },
  { key: "vitaminB12", label: "Vitamin B12", category: "Vitamins", target: 2.4, unit: "mcg" },
];

export const CronometerMicros: React.FC<CronometerMicrosProps> = ({ foodEntries }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Sum up all micronutrients from logged entries
  const totals: MicronutrientInfo = foodEntries.reduce((acc, entry) => {
    if (!entry.micros) return acc;
    return {
      fiber: (acc.fiber || 0) + (entry.micros.fiber || 0),
      sugar: (acc.sugar || 0) + (entry.micros.sugar || 0),
      sodium: (acc.sodium || 0) + (entry.micros.sodium || 0),
      potassium: (acc.potassium || 0) + (entry.micros.potassium || 0),
      calcium: (acc.calcium || 0) + (entry.micros.calcium || 0),
      iron: (acc.iron || 0) + (entry.micros.iron || 0),
      vitaminA: (acc.vitaminA || 0) + (entry.micros.vitaminA || 0),
      vitaminC: (acc.vitaminC || 0) + (entry.micros.vitaminC || 0),
      vitaminD: (acc.vitaminD || 0) + (entry.micros.vitaminD || 0),
      vitaminB12: (acc.vitaminB12 || 0) + (entry.micros.vitaminB12 || 0),
      magnesium: (acc.magnesium || 0) + (entry.micros.magnesium || 0),
      zinc: (acc.zinc || 0) + (entry.micros.zinc || 0),
      saturatedFat: (acc.saturatedFat || 0) + (entry.micros.saturatedFat || 0),
      cholesterol: (acc.cholesterol || 0) + (entry.micros.cholesterol || 0),
    };
  }, {} as MicronutrientInfo);

  const categories = ["All", "Vitamins", "Minerals", "Carbohydrates", "Lipids"];

  const filteredTargets = DEFAULT_TARGETS.filter(
    (t) => selectedCategory === "All" || t.category === selectedCategory
  );

  return (
    <div className="crono-card overflow-hidden">
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer border-b border-gray-100/60 hover:bg-gray-100/50 transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
              Full Micronutrient Targets
            </h2>
            <p className="text-xs text-gray-500">
              Vitamins, minerals, electrolytes & daily RDA targets
            </p>
          </div>
        </div>

        <button className="p-1 rounded-full text-gray-500">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-gray-100 text-gray-900 shadow-xs"
                    : "bg-gray-100 text-gray-500 hover:text-gray-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Micronutrient Progress Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredTargets.map((item) => {
              const currentVal = Number(totals[item.key] || 0);
              const percent = Math.min(200, Math.round((currentVal / item.target) * 100));
              const isOverWarning = item.warningLimit && currentVal > item.warningLimit;
              const isMet = percent >= 100 && !isOverWarning;

              let barColor = "#2EC47D"; // Green for met
              if (percent < 50) barColor = "#94A3B8"; // Slate for low
              if (percent >= 50 && percent < 100) barColor = "#00C1D4"; // Teal for getting close
              if (isOverWarning) barColor = "#EF4444"; // Red for over limit

              return (
                <div
                  key={item.key}
                  className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-900">{item.label}</span>
                    <span className="font-semibold text-gray-900">
                      {currentVal.toFixed(1)} / {item.target} {item.unit}{" "}
                      <span className="font-bold text-blue-500 ml-1">({percent}%)</span>
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, percent)}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
