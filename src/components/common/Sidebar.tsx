import React from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Dumbbell,
  TrendingUp,
  Bot,
  Target,
  History,
  Settings,
  Sparkles,
  Calculator,
} from "lucide-react";
import { useFitness } from "../../context/FitnessContext";

interface SidebarProps {
  onOpenSettings: () => void;
  onOpenGoals: () => void;
  onOpenWeeklyReview: () => void;
  onOpenStrengthTools?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenSettings,
  onOpenGoals,
  onOpenWeeklyReview,
  onOpenStrengthTools,
}) => {
  const { activeTab, setActiveTab, userProfile, weeklyWorkoutConsistency } = useFitness();

  const navItems = [
    { id: "home", label: "Dashboard", icon: LayoutDashboard },
    { id: "nutrition", label: "Diary & Foods", icon: UtensilsCrossed },
    { id: "workout", label: "Workouts", icon: Dumbbell },
    { id: "progress", label: "Trends & Charts", icon: TrendingUp },
  ];

  const secondaryItems = [
    { id: "tools", label: "Calculators", icon: Calculator, action: onOpenStrengthTools },
    { id: "goals", label: "Targets & Goals", icon: Target, action: onOpenGoals },
    { id: "history", label: "Workout History", icon: History, tab: "history" },
    { id: "review", label: "Weekly Report", icon: Sparkles, action: onOpenWeeklyReview },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r border-gray-100 bg-gray-50 h-[calc(100vh-53px)] sticky top-[53px] p-3 justify-between select-none">
      <div className="space-y-4">
        {/* User Profile Summary Card */}
        <div className="px-3.5 py-3 rounded-2xl bg-white border border-gray-100 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-bold text-sm">
            {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "R"}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-gray-900 truncate">{userProfile.name || "Remberto Valenzuela"}</p>
            <p className="text-[11px] text-gray-500 truncate capitalize">
              {userProfile.primaryGoal.replace("_", " ")}
            </p>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5">Views</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-gray-100 text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/70"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-gray-900" : "text-gray-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Modules */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5">Features</p>
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.id}
                id={`nav-secondary-${item.id}`}
                onClick={() => {
                  if (item.action) item.action();
                  else if (item.tab) setActiveTab(item.tab);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-gray-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Mini Progress Pill */}
      <div className="space-y-2 pt-3 border-t border-gray-100">
        <div className="px-3 py-2.5 rounded-xl bg-white border border-gray-100 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-medium">
            <span className="text-gray-500">Weekly Consistency</span>
            <span className="text-gray-900 font-bold">
              {weeklyWorkoutConsistency.completed} / {weeklyWorkoutConsistency.target} days
            </span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${weeklyWorkoutConsistency.percent}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          id="btn-sidebar-settings"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all font-medium"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

