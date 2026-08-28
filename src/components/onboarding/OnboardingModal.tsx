import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Check, Target, Activity, Flame } from "lucide-react";
import { PrimaryFitnessGoal, ActivityLevel } from "../../types";
import { useFitness } from "../../context/FitnessContext";

export const OnboardingModal: React.FC = () => {
  const { userProfile, completeOnboarding } = useFitness();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(userProfile.name || "");
  const [units, setUnits] = useState<"lbs" | "kg">(userProfile.preferredUnits || "lbs");
  const [currentWeight, setCurrentWeight] = useState(userProfile.currentWeight || 175);
  const [goalWeight, setGoalWeight] = useState(userProfile.goalWeight || 168);
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryFitnessGoal>(userProfile.primaryGoal || "lose_fat");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(userProfile.activityLevel || "moderately_active");
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(userProfile.weeklyWorkoutTarget || 4);

  // Sync state whenever onboarding opens
  useEffect(() => {
    if (!userProfile.onboardingCompleted) {
      setStep(1);
      setName(userProfile.name || "");
      setUnits(userProfile.preferredUnits || "lbs");
      setCurrentWeight(userProfile.currentWeight || 175);
      setGoalWeight(userProfile.goalWeight || 168);
      setPrimaryGoal(userProfile.primaryGoal || "lose_fat");
      setActivityLevel(userProfile.activityLevel || "moderately_active");
      setWeeklyWorkouts(userProfile.weeklyWorkoutTarget || 4);
    }
  }, [userProfile.onboardingCompleted]);

  if (userProfile.onboardingCompleted) return null;

  const handleFinish = () => {
    // Calculate intelligent baseline daily targets based on inputs
    const weightLbs = units === "lbs" ? currentWeight : currentWeight * 2.20462;
    let baseCalories = 2100;
    let baseProtein = Math.round(weightLbs * 0.85); // 0.85g per lb
    let baseCarbs = 200;
    let baseFat = 65;

    if (primaryGoal === "lose_fat") {
      baseCalories = Math.round(weightLbs * 11.5);
      baseProtein = Math.round(weightLbs * 0.95);
      baseCarbs = 180;
      baseFat = 55;
    } else if (primaryGoal === "build_muscle") {
      baseCalories = Math.round(weightLbs * 15.5);
      baseProtein = Math.round(weightLbs * 0.9);
      baseCarbs = 275;
      baseFat = 75;
    } else if (primaryGoal === "increase_strength") {
      baseCalories = Math.round(weightLbs * 15.0);
      baseProtein = Math.round(weightLbs * 0.95);
      baseCarbs = 260;
      baseFat = 70;
    }

    completeOnboarding({
      name: name.trim() || "Athlete",
      preferredUnits: units,
      currentWeight: Number(currentWeight),
      goalWeight: Number(goalWeight),
      primaryGoal,
      activityLevel,
      weeklyWorkoutTarget: Number(weeklyWorkouts),
      dailyTargets: {
        calories: baseCalories,
        protein: baseProtein,
        carbs: baseCarbs,
        fat: baseFat,
        steps: activityLevel === "very_active" ? 10000 : 8500,
        waterMl: 2800,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#ededed]">Welcome to Thrive OS</h2>
          <p className="text-xs text-white/50">
            Let's configure your personal fitness operating system for optimal precision.
          </p>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center justify-center gap-2">
          <div className={`w-8 h-1.5 rounded-full ${step >= 1 ? "bg-blue-500" : "bg-white/10"}`} />
          <div className={`w-8 h-1.5 rounded-full ${step >= 2 ? "bg-blue-500" : "bg-white/10"}`} />
        </div>

        {/* STEP 1: Basic Info & Goals */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="text-xs text-white/70 block mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex"
                className="w-full px-3.5 py-2 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] text-sm text-[#ededed] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/70 block mb-1">Current Weight</label>
                <input
                  type="number"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] text-sm font-mono text-[#ededed] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Goal Weight</label>
                <input
                  type="number"
                  value={goalWeight}
                  onChange={(e) => setGoalWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] text-sm font-mono text-[#ededed] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1">Units</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUnits("lbs")}
                  className={`py-2 rounded-xl text-xs font-mono border transition-all ${
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
                  className={`py-2 rounded-xl text-xs font-mono border transition-all ${
                    units === "kg"
                      ? "bg-blue-600/20 border-blue-500/40 text-blue-300"
                      : "bg-[#0f0f0f] border-[#1f1f1f] text-white/50"
                  }`}
                >
                  Kilograms (kg)
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Goal Strategy */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="text-xs text-white/70 block mb-1.5">Primary Fitness Objective</label>
              <div className="space-y-2">
                {[
                  { id: "lose_fat", label: "Fat Loss & Muscle Retention", desc: "Calorie deficit with high protein priority" },
                  { id: "build_muscle", label: "Hypertrophy / Muscle Building", desc: "Controlled surplus to maximize muscle gains" },
                  { id: "increase_strength", label: "Strength Progression", desc: "Focus on compound progressive overload" },
                  { id: "improve_fitness", label: "General Health & Longevity", desc: "Balanced lifestyle maintenance" },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setPrimaryGoal(item.id as PrimaryFitnessGoal)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      primaryGoal === item.id
                        ? "bg-blue-600/20 border-blue-500/50 text-[#ededed]"
                        : "bg-[#0f0f0f] border-[#1f1f1f] text-white/60 hover:border-[#2e2e2e]"
                    }`}
                  >
                    <p className="text-xs font-semibold">{item.label}</p>
                    <p className="text-[11px] text-white/40 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1">
                Planned Workouts Per Week ({weeklyWorkouts} sessions)
              </label>
              <input
                type="range"
                min="2"
                max="6"
                value={weeklyWorkouts}
                onChange={(e) => setWeeklyWorkouts(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] text-xs text-white/60"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Initialize My Plan</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
