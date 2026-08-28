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
  Award,
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
  const { activeTab, setActiveTab, userProfile, weeklyWorkoutConsistency, todayTotals } = useFitness();

  const navItems = [
    { id: "home", label: "Home", icon: LayoutDashboard },
    { id: "nutrition", label: "Nutrition", icon: UtensilsCrossed },
    { id: "workout", label: "Workouts", icon: Dumbbell },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "coach", label: "AI Coach", icon: Bot, badge: "AI" },
  ];

  const secondaryItems = [
    { id: "tools", label: "Strength Tools", icon: Calculator, action: onOpenStrengthTools },
    { id: "goals", label: "Goals", icon: Target, action: onOpenGoals },
    { id: "history", label: "History", icon: History, tab: "history" },
    { id: "review", label: "Weekly Review", icon: Sparkles, action: onOpenWeeklyReview },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[#1a1a1a] bg-[#0a0a0a] h-[calc(100vh-57px)] sticky top-[57px] p-4 justify-between select-none">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1c1c1c] border border-white/10 flex items-center justify-center text-[#ededed] font-medium text-sm">
            {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-[#ededed] truncate">{userProfile.name || "Alex Rivera"}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <p className="text-[10px] font-mono text-white/50 truncate capitalize">
                {userProfile.primaryGoal.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-white/30 mb-2">Main Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#161616] text-[#ededed] border border-[#2a2a2a] shadow-sm"
                    : "text-white/60 hover:text-[#ededed] hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-white/50"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Modules */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-white/30 mb-2">Workspace</p>
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
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#161616] text-[#ededed] border border-[#2a2a2a]"
                    : "text-white/50 hover:text-[#ededed] hover:bg-white/[0.03]"
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-white/40" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Mini Metrics Pill */}
      <div className="space-y-2 pt-4 border-t border-[#1a1a1a]">
        <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/50">Weekly Workouts</span>
            <span className="font-mono text-white/80 font-medium">
              {weeklyWorkoutConsistency.completed} / {weeklyWorkoutConsistency.target}
            </span>
          </div>
          <div className="w-full bg-[#1a1a1a] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${weeklyWorkoutConsistency.percent}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          id="btn-sidebar-settings"
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs text-white/50 hover:text-[#ededed] hover:bg-white/[0.03] transition-all"
        >
          <Settings className="w-4 h-4 text-white/40" />
          <span>System Settings</span>
        </button>
      </div>
    </aside>
  );
};
