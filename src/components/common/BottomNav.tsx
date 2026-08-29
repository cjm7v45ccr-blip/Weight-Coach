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

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-lg">
      {/* 1. Discover / Dashboard */}
      <button
        id="mobile-nav-home"
        onClick={() => setActiveTab("home")}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all ${
          activeTab === "home" ? "text-blue-600" : "text-gray-400 hover:text-gray-500"
        }`}
      >
        <BarChart3 className="w-5 h-5" />
        <span className={`text-[10px] mt-1 font-semibold ${activeTab === "home" ? "text-gray-900" : ""}`}>
          Discover
        </span>
      </button>

      {/* 2. Diary / Nutrition */}
      <button
        id="mobile-nav-nutrition"
        onClick={() => setActiveTab("nutrition")}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all ${
          activeTab === "nutrition" ? "text-blue-600" : "text-gray-400 hover:text-gray-500"
        }`}
      >
        <BookOpen className="w-5 h-5" />
        <span className={`text-[10px] mt-1 font-semibold ${activeTab === "nutrition" ? "text-gray-900" : ""}`}>
          Diary
        </span>
      </button>

      {/* 3. Center FAB Plus Action Button */}
      <div className="relative -top-3">
        <button
          id="mobile-fab-add"
          onClick={() => {
            if (onOpenQuickAdd) onOpenQuickAdd();
            else setActiveTab("nutrition");
          }}
          className="w-12 h-12 rounded-full bg-gray-900 hover:bg-black active:scale-95 text-white flex items-center justify-center shadow-md shadow-gray-900/10 transition-transform"
          aria-label="Add entry"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* 4. Trends / Progress */}
      <button
        id="mobile-nav-progress"
        onClick={() => setActiveTab("progress")}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all ${
          activeTab === "progress" ? "text-blue-600" : "text-gray-400 hover:text-gray-500"
        }`}
      >
        <Apple className="w-5 h-5" />
        <span className={`text-[10px] mt-1 font-semibold ${activeTab === "progress" ? "text-gray-900" : ""}`}>
          Trends
        </span>
      </button>

      {/* 5. AI Workouts */}
      <button
        id="mobile-nav-workout"
        onClick={() => setActiveTab("workout")}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all ${
          activeTab === "workout" ? "text-blue-600" : "text-gray-400 hover:text-gray-500"
        }`}
      >
        <Dumbbell className="w-5 h-5" />
        <span className={`text-[10px] mt-1 font-semibold ${activeTab === "workout" ? "text-gray-900" : ""}`}>
          Workouts
        </span>
      </button>
    </nav>
  );
};

