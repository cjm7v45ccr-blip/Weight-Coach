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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden flex flex-col p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto shadow-sm shadow-[#FF6B4A]/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Welcome to FatBot</h2>
          <p className="text-xs text-gray-500">
            Let's configure your smart nutrition targets and fitness parameters for precision tracking.
          </p>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center justify-center gap-2">
          <div className={`w-8 h-1.5 rounded-full ${step >= 1 ? "bg-white" : "bg-gray-200"}`} />
          <div className={`w-8 h-1.5 rounded-full ${step >= 2 ? "bg-white" : "bg-gray-200"}`} />
        </div>

        {/* STEP 1: Basic Info & Goals */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="text-xs font-semibold text-gray-900 block mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex"
                className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-900 font-medium focus:outline-none focus:border-gray-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-900 block mb-1">Current Weight</label>
                <input
                  type="number"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm font-mono font-bold text-gray-900 focus:outline-none focus:border-gray-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-900 block mb-1">Goal Weight</label>
                <input
                  type="number"
                  value={goalWeight}
                  onChange={(e) => setGoalWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm font-mono font-bold text-gray-900 focus:outline-none focus:border-gray-200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-900 block mb-1">Units</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUnits("lbs")}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                    units === "lbs"
                      ? "bg-white border-gray-200 text-gray-900 shadow-xs"
                      : "bg-gray-50 border-gray-100 text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Pounds (lbs)
                </button>
                <button
                  type="button"
                  onClick={() => setUnits("kg")}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                    units === "kg"
                      ? "bg-white border-gray-200 text-gray-900 shadow-xs"
                      : "bg-gray-50 border-gray-100 text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Kilograms (kg)
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-sm shadow-[#FF6B4A]/25 transition-all flex items-center justify-center gap-2"
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
              <label className="text-xs font-semibold text-gray-900 block mb-1.5">Primary Fitness Objective</label>
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
                        ? "bg-gray-100 border-gray-200 text-gray-900 shadow-xs"
                        : "bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-900">{item.label}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-900 block mb-1">
                Planned Workouts Per Week ({weeklyWorkouts} sessions)
              </label>
              <input
                type="range"
                min="2"
                max="6"
                value={weeklyWorkouts}
                onChange={(e) => setWeeklyWorkouts(Number(e.target.value))}
                className="w-full accent-[#00C1D4]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-white border border-gray-100 text-xs font-bold text-gray-500 hover:text-gray-900"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-sm shadow-[#2EC47D]/25 transition-all flex items-center justify-center gap-2"
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
