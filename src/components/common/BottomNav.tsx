import React from "react";
import {
  BarChart3,
  BookOpen,
  Plus,
  Apple,
  Dumbbell,
} from "lucide-react";
import { useFitness } from "../../context/FitnessContext";

interface BottomNavProps {
  onOpenQuickAdd?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenQuickAdd }) => {
  const { activeTab, setActiveTab } = useFitness();

  const navItems = [
    { id: "home" as const, label: "Discover", icon: BarChart3 },
    { id: "nutrition" as const, label: "Diary", icon: BookOpen },
    { id: "fab" as const, label: "Add", icon: Plus },
    { id: "progress" as const, label: "Trends", icon: Apple },
    { id: "workout" as const, label: "Workouts", icon: Dumbbell },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-2 pt-1.5 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-lg select-none">
      {/* 1. Discover / Dashboard */}
      <button
        id="mobile-nav-home"
        onClick={() => setActiveTab("home")}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-xl active:scale-95 transition-all ${
          activeTab === "home" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <div className={`p-1 rounded-lg ${activeTab === "home" ? "bg-gray-100 text-gray-900" : ""}`}>
          <BarChart3 className="w-5 h-5" />
        </div>
        <span className={`text-[10px] mt-0.5 font-bold ${activeTab === "home" ? "text-gray-900" : "text-gray-500"}`}>
          Discover
        </span>
      </button>

      {/* 2. Diary / Nutrition */}
      <button
        id="mobile-nav-nutrition"
        onClick={() => setActiveTab("nutrition")}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-xl active:scale-95 transition-all ${
          activeTab === "nutrition" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <div className={`p-1 rounded-lg ${activeTab === "nutrition" ? "bg-gray-100 text-gray-900" : ""}`}>
          <BookOpen className="w-5 h-5" />
        </div>
        <span className={`text-[10px] mt-0.5 font-bold ${activeTab === "nutrition" ? "text-gray-900" : "text-gray-500"}`}>
          Diary
        </span>
      </button>

      {/* 3. Center FAB Plus Action Button */}
      <div className="flex-1 flex items-center justify-center relative -top-3">
        <button
          id="mobile-fab-add"
          onClick={() => {
            if (onOpenQuickAdd) onOpenQuickAdd();
            else setActiveTab("nutrition");
          }}
          className="w-13 h-13 rounded-full bg-gray-900 hover:bg-black active:scale-90 text-white flex items-center justify-center shadow-lg shadow-gray-900/25 transition-transform"
          aria-label="Add entry"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* 4. Trends / Progress */}
      <button
        id="mobile-nav-progress"
        onClick={() => setActiveTab("progress")}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-xl active:scale-95 transition-all ${
          activeTab === "progress" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <div className={`p-1 rounded-lg ${activeTab === "progress" ? "bg-gray-100 text-gray-900" : ""}`}>
          <Apple className="w-5 h-5" />
        </div>
        <span className={`text-[10px] mt-0.5 font-bold ${activeTab === "progress" ? "text-gray-900" : "text-gray-500"}`}>
          Trends
        </span>
      </button>

      {/* 5. AI Workouts */}
      <button
        id="mobile-nav-workout"
        onClick={() => setActiveTab("workout")}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-xl active:scale-95 transition-all ${
          activeTab === "workout" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <div className={`p-1 rounded-lg ${activeTab === "workout" ? "bg-gray-100 text-gray-900" : ""}`}>
          <Dumbbell className="w-5 h-5" />
        </div>
        <span className={`text-[10px] mt-0.5 font-bold ${activeTab === "workout" ? "text-gray-900" : "text-gray-500"}`}>
          Workouts
        </span>
      </button>
    </nav>
  );
};

