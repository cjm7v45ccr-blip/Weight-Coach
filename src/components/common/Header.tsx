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
    <header className="sticky top-0 z-30 w-full bg-gray-50/90 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 py-3 flex items-center justify-between transition-all">
      {/* Brand Identity: FatBot */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-xs">
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-extrabold text-xl tracking-tight text-gray-900">FatBot</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">AI</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Cloud Sync Status Badge */}
        <button
          onClick={onOpenSettings}
          title={isCloudSynced ? `Cloud Sync Active: ${syncAccountId || "Firebase"}` : "Click to connect cloud sync"}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-[11px] font-medium shadow-xs transition-colors"
        >
          <span className={`w-2 h-2 rounded-full ${isCloudSynced ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
          <Cloud className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden md:inline font-semibold text-gray-800">
            {isSyncing ? "Syncing..." : isCloudSynced ? "Cloud Synced" : "Offline"}
          </span>
        </button>

        <button
          onClick={onOpenQuickLogFood}
          id="btn-header-log-food"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Food</span>
        </button>

        <button
          onClick={() => (activeWorkout ? startWorkout() : startEmptyWorkout())}
          id="btn-header-workout"
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-medium transition-all shadow-xs"
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>{activeWorkout ? "Resume Session" : "Train"}</span>
        </button>

        {onOpenStrengthTools && (
          <button
            onClick={onOpenStrengthTools}
            id="btn-header-tools"
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="Calculators"
          >
            <Utensils className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onOpenWeeklyReview}
          id="btn-header-announcements"
          className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          title="Weekly Summary"
        >
          <Bell className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          id="btn-header-settings"
          className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

