import React from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Dumbbell,
  TrendingUp,
  Bot,
} from "lucide-react";
import { useFitness } from "../../context/FitnessContext";

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useFitness();

  const navItems = [
    { id: "home", label: "Home", icon: LayoutDashboard },
    { id: "nutrition", label: "Nutrition", icon: UtensilsCrossed },
    { id: "workout", label: "Workout", icon: Dumbbell },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "coach", label: "Coach", icon: Bot, isAi: true },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-[#1a1a1a] px-2 py-1.5 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              isActive ? "text-blue-400" : "text-white/45 hover:text-white/80"
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
              {item.isAi && (
                <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-[#0a0a0a]"></span>
              )}
            </div>
            <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? "text-[#ededed]" : ""}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
