import React from "react";
import { Sparkles, Settings, Dumbbell, Utensils, Target, Flame, RotateCcw, Calculator } from "lucide-react";
import { useFitness } from "../../context/FitnessContext";
import momentumLogo from "../../assets/images/momentum_logo_1787885888279.jpg";

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenQuickLogFood: () => void;
  onOpenGoals: () => void;
  onOpenWeeklyReview: () => void;
  onOpenStrengthTools?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenQuickLogFood,
  onOpenGoals,
  onOpenWeeklyReview,
  onOpenStrengthTools,
}) => {
  const { userProfile, activeWorkout, startWorkout, todayTotals, isTodayWorkoutCompleted } = useFitness();

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#1a1a1a] px-4 md:px-8 py-3.5 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/40 flex-shrink-0 bg-[#121212]">
            <img src={momentumLogo} alt="Momentum Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-widest text-white">MOMENTUM</span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-white/50 tracking-wider font-mono">MOVE FORWARD. BECOME MORE.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Strength Tools Trigger */}
        {onOpenStrengthTools && (
          <button
            onClick={onOpenStrengthTools}
            id="btn-header-strength-tools"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f0f0f] hover:bg-[#1a1a1a] border border-[#1f1f1f] text-xs text-white/80 transition-all font-medium"
            title="Plate Calculator & 1RM Estimator"
          >
            <Calculator className="w-3.5 h-3.5 text-blue-400" />
            <span>Strength Tools</span>
          </button>
        )}

        {/* Weekly Review Quick Trigger */}
        <button
          onClick={onOpenWeeklyReview}
          id="btn-header-weekly-review"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f0f0f] hover:bg-[#1a1a1a] border border-[#1f1f1f] text-xs text-white/80 transition-all font-medium"
          title="View Weekly Review"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Weekly Review</span>
        </button>

        {/* Goals Trigger */}
        <button
          onClick={onOpenGoals}
          id="btn-header-goals"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f0f0f] hover:bg-[#1a1a1a] border border-[#1f1f1f] text-xs text-white/80 transition-all font-medium"
          title="Active Goals"
        >
          <Target className="w-3.5 h-3.5 text-blue-400" />
          <span>Goals</span>
        </button>

        {/* Quick Log Food Button */}
        <button
          onClick={onOpenQuickLogFood}
          id="btn-header-quick-food"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f0f0f] hover:bg-[#1a1a1a] border border-[#1f1f1f] text-xs text-[#ededed] transition-all font-medium"
        >
          <Utensils className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden xs:inline">Log Food</span>
        </button>

        {/* Start / Resume Workout CTA */}
        {activeWorkout ? (
          <button
            onClick={() => startWorkout()}
            id="btn-header-active-workout"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 animate-pulse transition-all"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Active Session</span>
          </button>
        ) : (
          <button
            onClick={() => startWorkout()}
            id="btn-header-start-workout"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/15 transition-all"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isTodayWorkoutCompleted ? "Extra Workout" : "Start Workout"}</span>
            <span className="sm:hidden">Train</span>
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          id="btn-header-settings"
          className="p-1.5 sm:p-2 rounded-lg bg-[#0f0f0f] hover:bg-[#1a1a1a] border border-[#1f1f1f] text-white/60 hover:text-white transition-all"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
