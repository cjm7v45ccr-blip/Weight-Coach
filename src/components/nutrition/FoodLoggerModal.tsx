import React, { useState } from "react";
import {
  X,
  Sparkles,
  Search,
  Plus,
  Utensils,
  Check,
  Loader2,
  Trash2,
  Edit2,
  Flame,
  Layers,
} from "lucide-react";
import { MealType, FoodItem } from "../../types";
import { useFitness } from "../../context/FitnessContext";
import { commonFoodDatabase } from "../../data/initialData";
import { aiService, ParsedFoodResult } from "../../services/aiService";

interface FoodLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMealType?: MealType;
}

export const FoodLoggerModal: React.FC<FoodLoggerModalProps> = ({
  isOpen,
  onClose,
  initialMealType = "lunch",
}) => {
  const { addFoodItem, addFoodItems } = useFitness();
  const [activeTab, setActiveTab] = useState<"ai_parser" | "search" | "manual">("ai_parser");
  const [mealType, setMealType] = useState<MealType>(initialMealType);

  // AI Fast Natural Language State
  const [nlpInput, setNlpInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedFoodResult | null>(null);

  // Search Food Database State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDbItem, setSelectedDbItem] = useState<any | null>(null);
  const [servingMultiplier, setServingMultiplier] = useState(1);

  // Manual Entry Form State
  const [manualName, setManualName] = useState("");
  const [manualServing, setManualServing] = useState("1 serving");
  const [manualCalories, setManualCalories] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualFat, setManualFat] = useState("");

  if (!isOpen) return null;

  const mealOptions: { id: MealType; label: string }[] = [
    { id: "breakfast", label: "Breakfast" },
    { id: "lunch", label: "Lunch" },
    { id: "dinner", label: "Dinner" },
    { id: "snack", label: "Snack" },
    { id: "drink", label: "Drink" },
  ];

  // Handle Natural Language Parse
  const handleParseNlp = async () => {
    if (!nlpInput.trim()) return;
    setIsParsing(true);
    try {
      const result = await aiService.parseFood(nlpInput);
      setParsedResult(result);
    } catch (err) {
      console.error("Parse error:", err);
    } finally {
      setIsParsing(false);
    }
  };

  // Commit Parsed Items to Nutrition Log
  const handleCommitParsed = () => {
    if (!parsedResult || parsedResult.items.length === 0) return;
    const itemsToAdd = parsedResult.items.map((item) => ({
      name: item.name,
      mealType,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      servingSize: item.serving || "1 serving",
      timestamp: new Date().toISOString(),
    }));

    addFoodItems(itemsToAdd);
    onClose();
    // Reset state
    setNlpInput("");
    setParsedResult(null);
  };

  // Quick preset examples
  const examplePrompts = [
    "2 eggs, 3 tbsp longaniza and cheese",
    "200g grilled chicken breast, 1.5 cup jasmine rice and steamed broccoli",
    "1 scoop whey protein, 1 banana and 2 tbsp peanut butter",
    "8 oz ribeye steak with baked sweet potato and asparagus",
  ];

  // Filtered Food Database items
  const filteredDbFoods = commonFoodDatabase.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Commit DB Item
  const handleCommitDbItem = (item: any) => {
    const qty = Number(servingMultiplier) || 1;
    addFoodItem({
      name: item.name,
      mealType,
      calories: Math.round(item.calories * qty),
      protein: Math.round(item.protein * qty * 10) / 10,
      carbs: Math.round(item.carbs * qty * 10) / 10,
      fat: Math.round(item.fat * qty * 10) / 10,
      servingSize: `${qty}x (${item.servingSize})`,
      timestamp: new Date().toISOString(),
    });
    onClose();
    setSelectedDbItem(null);
    setSearchQuery("");
  };

  // Commit Manual Entry
  const handleCommitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    addFoodItem({
      name: manualName.trim(),
      mealType,
      calories: Number(manualCalories) || 0,
      protein: Number(manualProtein) || 0,
      carbs: Number(manualCarbs) || 0,
      fat: Number(manualFat) || 0,
      servingSize: manualServing.trim() || "1 serving",
      timestamp: new Date().toISOString(),
    });

    onClose();
    setManualName("");
    setManualCalories("");
    setManualProtein("");
    setManualCarbs("");
    setManualFat("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] bg-[#0c0c0c]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#ededed]">Log Food & Macros</h2>
              <p className="text-xs text-white/40">Fast natural language parsing or verified database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Category Selector */}
        <div className="px-6 pt-4 pb-2">
          <label className="text-[11px] font-mono uppercase text-white/40 mb-1.5 block">Log To Meal</label>
          <div className="grid grid-cols-5 gap-1.5 p-1 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
            {mealOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMealType(opt.id)}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${
                  mealType === opt.id
                    ? "bg-[#1f1f1f] text-[#ededed] shadow-sm border border-[#2e2e2e]"
                    : "text-white/50 hover:text-white hover:bg-white/[0.02]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1a1a1a] px-6 gap-6 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("ai_parser")}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "ai_parser"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast AI Parser</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "search"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Food Database</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "manual"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </button>
        </div>

        {/* Modal Body with Scroll */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: Fast AI Parser */}
          {activeTab === "ai_parser" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/70 mb-1.5 block">
                  Describe what you ate in natural language:
                </label>
                <div className="relative">
                  <textarea
                    value={nlpInput}
                    onChange={(e) => setNlpInput(e.target.value)}
                    placeholder='e.g., "2 eggs, 3 tbsp longaniza and cheese"'
                    rows={3}
                    className="w-full rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] px-3.5 py-2.5 text-sm text-[#ededed] placeholder:text-white/25 focus:outline-none focus:border-emerald-500/50 transition-all resize-none font-sans"
                  />
                </div>
              </div>

              {/* Example Chips */}
              <div>
                <p className="text-[11px] font-mono text-white/40 mb-1.5">Try an example:</p>
                <div className="flex flex-wrap gap-1.5">
                  {examplePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNlpInput(prompt);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-[#0f0f0f] hover:bg-[#1a1a1a] border border-[#1f1f1f] text-white/60 hover:text-white text-left transition-all truncate max-w-full"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleParseNlp}
                disabled={isParsing || !nlpInput.trim()}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Parsing Ingredients & Macros...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze & Decompose Meal</span>
                  </>
                )}
              </button>

              {/* Parsed Result Preview */}
              {parsedResult && (
                <div className="p-4 rounded-xl bg-[#0f0f0f] border border-emerald-500/30 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-emerald-400 font-semibold">
                      Parsed Items ({parsedResult.items.length})
                    </span>
                    <span className="text-xs text-white/40">Ready to save</span>
                  </div>

                  <div className="space-y-2 divide-y divide-white/[0.04]">
                    {parsedResult.items.map((item, idx) => (
                      <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-medium text-white/90">{item.name}</p>
                          <p className="text-[11px] text-white/40 font-mono">
                            {item.calories} kcal · {item.protein}g P · {item.carbs}g C · {item.fat}g F
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-white/60">
                          {item.serving || "1 serving"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary Total */}
                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-mono uppercase text-white/40">Total Summary</p>
                      <p className="text-sm font-bold font-mono text-white/95">
                        {parsedResult.totals.calories} kcal
                      </p>
                    </div>
                    <div className="text-right text-xs font-mono text-white/70">
                      <span>{parsedResult.totals.protein}g P</span> ·{" "}
                      <span>{parsedResult.totals.carbs}g C</span> ·{" "}
                      <span>{parsedResult.totals.fat}g F</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCommitParsed}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Log All {parsedResult.items.length} Items to {mealType}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Search Food Database */}
          {activeTab === "search" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chicken breast, oats, salmon, eggs..."
                  className="w-full rounded-xl bg-white/[0.03] border border-white/[0.1] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredDbFoods.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleCommitDbItem(item)}
                    className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/[0.1] cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white/90 group-hover:text-emerald-400 transition-colors">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-white/40 font-mono mt-0.5">
                        {item.servingSize} · {item.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-white/90">{item.calories} kcal</p>
                      <p className="text-[10px] font-mono text-white/50">
                        {item.protein}g P · {item.carbs}g C · {item.fat}g F
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Manual Food Entry */}
          {activeTab === "manual" && (
            <form onSubmit={handleCommitManual} className="space-y-3.5">
              <div>
                <label className="text-xs text-white/70 block mb-1">Food Name *</label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Ribeye Steak"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/[0.1] px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Serving Description</label>
                <input
                  type="text"
                  value={manualServing}
                  onChange={(e) => setManualServing(e.target.value)}
                  placeholder="e.g. 1 fillet (200g)"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/[0.1] px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[11px] font-mono uppercase text-white/50 block mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    required
                    value={manualCalories}
                    onChange={(e) => setManualCalories(e.target.value)}
                    placeholder="350"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/[0.1] px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase text-white/50 block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualProtein}
                    onChange={(e) => setManualProtein(e.target.value)}
                    placeholder="30"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/[0.1] px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase text-white/50 block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualCarbs}
                    onChange={(e) => setManualCarbs(e.target.value)}
                    placeholder="25"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/[0.1] px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase text-white/50 block mb-1">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualFat}
                    onChange={(e) => setManualFat(e.target.value)}
                    placeholder="12"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/[0.1] px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Save to {mealType}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
