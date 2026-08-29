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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 border border-amber-200 text-amber-500">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Target Objectives & Milestones</h2>
              <p className="text-xs text-gray-500">Track progress toward specific body composition & strength benchmarks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-white">
          {/* Rate Forecaster & Pace Adjuster */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowPaceSlider(!showPaceSlider)}
              className="flex items-center gap-2 text-xs font-bold text-gray-900 hover:text-gray-700 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Weekly Rate of Loss & Caloric Deficit Pace</span>
              <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
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
                  className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2.5 hover:border-gray-200 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">{goal.title}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 capitalize">
                          {goal.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        Target date: {goal.targetDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-gray-900">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                      <span>Start: {goal.startValue} {goal.unit}</span>
                      <span className="text-blue-500">{percent}% Completed</span>
                      <span>Target: {goal.targetValue} {goal.unit}</span>
                    </div>
                  </div>

                  {goal.notes && (
                    <p className="text-xs text-gray-500 bg-white p-2 rounded-lg border border-gray-100">
                      {goal.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Goal Toggle / Form */}
          {showAddForm ? (
            <form onSubmit={handleAddGoalSubmit} className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-3 animate-fade-in">
              <h4 className="text-xs font-bold text-gray-900">Create New Goal</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Goal Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Reach 175 lbs at 12% body fat"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-100 text-xs text-gray-900 focus:outline-none focus:border-gray-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as GoalType)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-100 text-xs text-gray-900 focus:outline-none focus:border-gray-200"
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
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Start Value</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="184"
                    value={startVal}
                    onChange={(e) => setStartVal(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-gray-100 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-gray-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Current Value</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="181.4"
                    value={currVal}
                    onChange={(e) => setCurrVal(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-gray-100 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-gray-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Target Value</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="175"
                    value={targetVal}
                    onChange={(e) => setTargetVal(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-gray-100 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-gray-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-gray-500 hover:text-gray-900 border border-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-xs font-bold text-white shadow-xs"
                >
                  Save Goal
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 rounded-xl border border-dashed border-gray-200 hover:border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-900 text-xs font-bold flex items-center justify-center gap-2 transition-all"
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
