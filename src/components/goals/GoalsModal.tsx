import React, { useState } from "react";
import { X, Target, Plus, CheckCircle, Trash2, TrendingUp, Sparkles, Sliders } from "lucide-react";
import { UserGoal, GoalType } from "../../types";
import { useFitness } from "../../context/FitnessContext";
import { WeeklyRateSlider } from "../common/WeeklyRateSlider";

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoalsModal: React.FC<GoalsModalProps> = ({ isOpen, onClose }) => {
  const { goals, addGoal, updateGoal, deleteGoal, userProfile, updateDailyTargets } = useFitness();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPaceSlider, setShowPaceSlider] = useState(true);

  // New goal state
  const [title, setTitle] = useState("");
  const [type, setType] = useState<GoalType>("weight");
  const [startVal, setStartVal] = useState("");
  const [currVal, setCurrVal] = useState("");
  const [targetVal, setTargetVal] = useState("");
  const [unit, setUnit] = useState(userProfile.preferredUnits);
  const [targetDate, setTargetDate] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addGoal({
      title: title.trim(),
      type,
      startValue: Number(startVal) || 0,
      currentValue: Number(currVal) || Number(startVal) || 0,
      targetValue: Number(targetVal) || 0,
      unit,
      targetDate: targetDate || "2026-11-30",
      status: "active",
      notes,
    });

    setTitle("");
    setStartVal("");
    setCurrVal("");
    setTargetVal("");
    setNotes("");
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] bg-[#0c0c0c]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#ededed]">Target Objectives & Milestones</h2>
              <p className="text-xs text-white/40">Track progress toward specific body composition & strength benchmarks</p>
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
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Rate Forecaster & Pace Adjuster */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowPaceSlider(!showPaceSlider)}
              className="flex items-center gap-2 text-xs font-semibold text-[#ededed] hover:text-white transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Weekly Rate of Loss & Caloric Deficit Pace</span>
              <span className="text-[10px] font-mono text-white/40 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                {showPaceSlider ? "Collapse Slider" : "Expand Slider"}
              </span>
            </button>

            {showPaceSlider && (
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

          {/* Goals List */}
          <div className="space-y-3">
            {goals.map((goal) => {
              const totalDelta = Math.abs(goal.targetValue - goal.startValue);
              const progressDelta = Math.abs(goal.currentValue - goal.startValue);
              const percent = totalDelta > 0 ? Math.min(100, Math.round((progressDelta / totalDelta) * 100)) : 100;

              return (
                <div
                  key={goal.id}
                  className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] space-y-2.5 hover:border-[#2e2e2e] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#ededed]">{goal.title}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 capitalize">
                          {goal.type}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 font-mono mt-0.5">
                        Target date: {goal.targetDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#ededed]">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 text-white/30 hover:text-rose-400 transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-[#161616] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                      <span>Start: {goal.startValue} {goal.unit}</span>
                      <span>{percent}% Completed</span>
                      <span>Target: {goal.targetValue} {goal.unit}</span>
                    </div>
                  </div>

                  {goal.notes && (
                    <p className="text-xs text-white/50 bg-[#141414] p-2 rounded-lg border border-[#1f1f1f]">
                      {goal.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Goal Toggle / Form */}
          {showAddForm ? (
            <form onSubmit={handleAddGoalSubmit} className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] space-y-3 animate-fade-in">
              <h4 className="text-xs font-semibold text-[#ededed]">Create New Goal</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-white/40 block mb-1">Goal Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Reach 175 lbs at 12% body fat"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#141414] border border-[#222222] text-xs text-[#ededed]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/40 block mb-1">Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as GoalType)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#141414] border border-[#222222] text-xs text-[#ededed]"
                  >
                    <option value="weight">Body Weight</option>
                    <option value="strength">Strength / Lift</option>
                    <option value="habit">Habit / Consistency</option>
                    <option value="nutrition">Nutrition Target</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-white/40 block mb-1">Start Value</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="184"
                    value={startVal}
                    onChange={(e) => setStartVal(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#141414] border border-[#222222] text-xs font-mono text-[#ededed]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/40 block mb-1">Current Value</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="181.4"
                    value={currVal}
                    onChange={(e) => setCurrVal(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#141414] border border-[#222222] text-xs font-mono text-[#ededed]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/40 block mb-1">Target Value</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="175"
                    value={targetVal}
                    onChange={(e) => setTargetVal(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#141414] border border-[#222222] text-xs font-mono text-[#ededed]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-xs text-white/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-500/20"
                >
                  Save Goal
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 rounded-xl border border-dashed border-[#1f1f1f] hover:border-[#2e2e2e] hover:bg-white/[0.02] text-white/60 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Objective</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
