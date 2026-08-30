import React from "react";
import { Settings, Utensils, Bell, Plus, Dumbbell, Bot, Cloud, RefreshCw } from "lucide-react";
import { useFitness } from "../../context/FitnessContext";

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
  const { activeWorkout, startWorkout, startEmptyWorkout, isCloudSynced, isSyncing, forceSyncToCloud, syncAccountId } = useFitness();

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 flex items-center justify-between transition-all">
      {/* Brand Identity: FatBot */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-xs shrink-0">
          <Bot className="w-4.5 h-4.5" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-gray-900">FatBot</span>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">AI</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Cloud Sync Status Badge */}
        <button
          onClick={onOpenSettings}
          title={isCloudSynced ? `Cloud Sync Active: ${syncAccountId || "Firebase"}` : "Click to connect cloud sync"}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full bg-gray-50 border border-gray-200/80 text-gray-700 hover:bg-gray-100 text-[11px] font-medium transition-colors"
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${isCloudSynced ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
          <Cloud className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="hidden sm:inline font-semibold text-gray-800 text-[11px]">
            {isSyncing ? "Syncing..." : isCloudSynced ? "Synced" : "Offline"}
          </span>
        </button>

        <button
          onClick={onOpenQuickLogFood}
          id="btn-header-log-food"
          className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="text-xs">Add Food</span>
        </button>

        <button
          onClick={() => (activeWorkout ? startWorkout() : startEmptyWorkout())}
          id="btn-header-workout"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-medium transition-all shadow-xs"
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>{activeWorkout ? "Resume Session" : "Train"}</span>
        </button>

        {onOpenStrengthTools && (
          <button
            onClick={onOpenStrengthTools}
            id="btn-header-tools"
            className="p-1.5 sm:p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="Calculators"
          >
            <Utensils className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onOpenWeeklyReview}
          id="btn-header-announcements"
          className="p-1.5 sm:p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          title="Weekly Summary"
        >
          <Bell className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          id="btn-header-settings"
          className="p-1.5 sm:p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

