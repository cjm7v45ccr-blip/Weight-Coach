import React, { useState, useEffect } from "react";
import { X, Settings, RotateCcw, Trash2, Check, User, Target, Flame, Utensils, Sliders } from "lucide-react";
import { useFitness } from "../../context/FitnessContext";
import { PrimaryFitnessGoal } from "../../types";
import { WeeklyRateSlider } from "../common/WeeklyRateSlider";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    userProfile,
    updateUserProfile,
    updateDailyTargets,
    resetToDemoData,
    clearAllData,
  } = useFitness();

  const [name, setName] = useState(userProfile.name);
  const [units, setUnits] = useState(userProfile.preferredUnits);
  const [goal, setGoal] = useState<PrimaryFitnessGoal>(userProfile.primaryGoal);
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(userProfile.weeklyWorkoutTarget);

  // Targets
  const [calories, setCalories] = useState(userProfile.dailyTargets.calories);
  const [protein, setProtein] = useState(userProfile.dailyTargets.protein);
  const [carbs, setCarbs] = useState(userProfile.dailyTargets.carbs);
  const [fat, setFat] = useState(userProfile.dailyTargets.fat);
  const [steps, setSteps] = useState(userProfile.dailyTargets.steps);
  const [waterMl, setWaterMl] = useState(userProfile.dailyTargets.waterMl);

  // Preferences
  const [dietary, setDietary] = useState(userProfile.dietaryPreferences?.join(", ") || "");
  const [avoided, setAvoided] = useState(userProfile.avoidedFoods?.join(", ") || "");

  // Synchronize modal state whenever modal opens or user profile is updated
  useEffect(() => {
    if (isOpen) {
      setName(userProfile.name || "");
      setUnits(userProfile.preferredUnits || "lbs");
      setGoal(userProfile.primaryGoal || "lose_fat");
      setWorkoutsPerWeek(userProfile.weeklyWorkoutTarget || 4);
      setCalories(userProfile.dailyTargets.calories || 2000);
      setProtein(userProfile.dailyTargets.protein || 140);
      setCarbs(userProfile.dailyTargets.carbs || 200);
      setFat(userProfile.dailyTargets.fat || 65);
      setSteps(userProfile.dailyTargets.steps || 8500);
      setWaterMl(userProfile.dailyTargets.waterMl || 2800);
      setDietary((userProfile.dietaryPreferences || []).join(", "));
      setAvoided((userProfile.avoidedFoods || []).join(", "));
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      preferredUnits: units,
      primaryGoal: goal,
      weeklyWorkoutTarget: Number(workoutsPerWeek),
      dietaryPreferences: dietary.split(",").map((s) => s.trim()).filter(Boolean),
      avoidedFoods: avoided.split(",").map((s) => s.trim()).filter(Boolean),
    });

    updateDailyTargets({
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
      steps: Number(steps),
      waterMl: Number(waterMl),
    });

    onClose();
  };

  const handleClearLogs = () => {
    clearAllData();
    onClose();
  };

  const handleLoadDemo = () => {
    resetToDemoData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] bg-[#0c0c0c]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/[0.04] border border-[#1a1a1a] text-white/80">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#ededed]">Settings & Targets</h2>
              <p className="text-xs text-white/40">Adjust macro splits, unit system, and coach constraints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* User Profile */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-white/40">User Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/70 block mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0f0f0f] border border-[#1f1f1f] text-xs text-[#ededed] focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Preferred Units</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUnits("lbs")}
                    className={`py-1.5 text-xs font-mono rounded-lg border transition-all ${
                      units === "lbs"
                        ? "bg-blue-600/20 border-blue-500/40 text-blue-300"
                        : "bg-[#0f0f0f] border-[#1f1f1f] text-white/50"
                    }`}
                  >
                    Pounds (lbs)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnits("kg")}
                    className={`py-1.5 text-xs font-mono rounded-lg border transition-all ${
                      units === "kg"
                        ? "bg-blue-600/20 border-blue-500/40 text-blue-300"
                        : "bg-[#0f0f0f] border-[#1f1f1f] text-white/50"
                    }`}
                  >
                    Kilograms (kg)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Fitness Goal */}
          <div className="space-y-3 pt-3 border-t border-[#1a1a1a]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-white/40">Strategy & Focus</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/70 block mb-1">Primary Objective</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as PrimaryFitnessGoal)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0f0f0f] border border-[#1f1f1f] text-xs text-[#ededed] focus:outline-none focus:border-blue-500/50"
                >
                  <option value="lose_fat">Fat Loss / Body Recomposition</option>
                  <option value="build_muscle">Muscle Growth / Hypertrophy</option>
                  <option value="increase_strength">Pure Strength Progression</option>
                  <option value="maintain">Maintenance & Athletic Performance</option>
                  <option value="improve_fitness">General Health & Longevity</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Weekly Workout Frequency</label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={workoutsPerWeek}
                  onChange={(e) => setWorkoutsPerWeek(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0f0f0f] border border-[#1f1f1f] text-xs font-mono text-[#ededed] focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>
          </div>

          {/* Rate of Loss / Surplus & Deficit Interactive Adjuster */}
          <div className="space-y-3 pt-3 border-t border-[#1a1a1a]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                Deficit Pace & Weekly Rate Forecast
              </h3>
            </div>

            <WeeklyRateSlider
              userProfile={{
                ...userProfile,
                primaryGoal: goal,
                weeklyWorkoutTarget: workoutsPerWeek,
                preferredUnits: units,
              }}
              currentCalories={calories}
              currentProtein={protein}
              currentCarbs={carbs}
              currentFat={fat}
              currentSteps={steps}
              currentWaterMl={waterMl}
              onTargetsChange={(targets) => {
                setCalories(targets.calories);
                setProtein(targets.protein);
                setCarbs(targets.carbs);
                setFat(targets.fat);
                if (targets.steps !== undefined) setSteps(targets.steps);
                if (targets.waterMl !== undefined) setWaterMl(targets.waterMl);
              }}
            />
          </div>

          {/* Macro Targets */}
          <div className="space-y-3 pt-3 border-t border-[#1a1a1a]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-white/40">Daily Targets (Manual & Auto-Synced)</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] font-mono text-white/40 block mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0f0f0f] border border-[#1f1f1f] text-xs font-mono text-[#ededed] focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-white/40 block mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0f0f0f] border border-[#1f1f1f] text-xs font-mono text-[#ededed] focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-white/40 block mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0f0f0f] border border-[#1f1f1f] text-xs font-mono text-[#ededed] focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-white/40 block mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0f0f0f] border border-[#1f1f1f] text-xs font-mono text-[#ededed] focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-white/40 block mb-1">Steps Target</label>
                <input
                  type="number"
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0f0f0f] border border-[#1f1f1f] text-xs font-mono text-[#ededed] focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-white/40 block mb-1">Water Target (ml)</label>
                <input
                  type="number"
                  value={waterMl}
                  onChange={(e) => setWaterMl(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0f0f0f] border border-[#1f1f1f] text-xs font-mono text-[#ededed] focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>
          </div>

          {/* Reset Utilities */}
          <div className="space-y-3 pt-3 border-t border-[#1a1a1a]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-white/40">Data Management</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleLoadDemo}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-[#1a1a1a] text-xs text-white/70 flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Load Sample Data</span>
              </button>

              <button
                type="button"
                onClick={handleClearLogs}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Logs</span>
              </button>
            </div>
          </div>

          {/* Footer Save Actions */}
          <div className="pt-4 border-t border-[#1a1a1a] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-white/50 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
