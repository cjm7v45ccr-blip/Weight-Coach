import React, { useState } from "react";
import { FitnessProvider, useFitness } from "./context/FitnessContext";
import { Header } from "./components/common/Header";
import { Sidebar } from "./components/common/Sidebar";
import { BottomNav } from "./components/common/BottomNav";
import { RestTimerBanner } from "./components/common/RestTimerBanner";

// Views
import { HomeView } from "./views/HomeView";
import { NutritionView } from "./views/NutritionView";
import { WorkoutView } from "./views/WorkoutView";
import { ProgressView } from "./views/ProgressView";

// Modals
import { FoodLoggerModal } from "./components/nutrition/FoodLoggerModal";
import { ActiveWorkoutModal } from "./components/workout/ActiveWorkoutModal";
import { WorkoutHistoryModal } from "./components/workout/WorkoutHistoryModal";
import { NewRoutineModal } from "./components/workout/NewRoutineModal";
import { GoalsModal } from "./components/goals/GoalsModal";
import { WeeklyReviewModal } from "./components/weekly/WeeklyReviewModal";
import { SettingsModal } from "./components/settings/SettingsModal";
import { OnboardingModal } from "./components/onboarding/OnboardingModal";
import { StrengthToolsModal } from "./components/tools/StrengthToolsModal";
import { MealType } from "./types";

const MainAppContent: React.FC = () => {
  const { activeTab } = useFitness();

  // Modal Visibility States
  const [isFoodLoggerOpen, setIsFoodLoggerOpen] = useState(false);
  const [foodLoggerMealType, setFoodLoggerMealType] = useState<MealType>("lunch");
  const [foodLoggerInitialTab, setFoodLoggerInitialTab] = useState<"camera" | "ai_parser" | "search" | "manual">("camera");
  const [isWorkoutHistoryOpen, setIsWorkoutHistoryOpen] = useState(false);
  const [isNewRoutineOpen, setIsNewRoutineOpen] = useState(false);
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [isWeeklyReviewOpen, setIsWeeklyReviewOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStrengthToolsOpen, setIsStrengthToolsOpen] = useState(false);

  const handleOpenFoodLogger = (
    mealType: MealType = "lunch",
    tab: "camera" | "ai_parser" | "search" | "manual" = "camera"
  ) => {
    setFoodLoggerMealType(mealType);
    setFoodLoggerInitialTab(tab);
    setIsFoodLoggerOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Global Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenQuickLogFood={() => handleOpenFoodLogger("lunch")}
        onOpenGoals={() => setIsGoalsOpen(true)}
        onOpenWeeklyReview={() => setIsWeeklyReviewOpen(true)}
        onOpenStrengthTools={() => setIsStrengthToolsOpen(true)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenGoals={() => setIsGoalsOpen(true)}
          onOpenWeeklyReview={() => setIsWeeklyReviewOpen(true)}
          onOpenStrengthTools={() => setIsStrengthToolsOpen(true)}
        />

        {/* Dynamic Primary View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pb-8">
          {activeTab === "home" && (
            <HomeView
              onOpenFoodLogger={handleOpenFoodLogger}
              onOpenGoals={() => setIsGoalsOpen(true)}
              onOpenWeeklyReview={() => setIsWeeklyReviewOpen(true)}
              onOpenStrengthTools={() => setIsStrengthToolsOpen(true)}
            />
          )}

          {activeTab === "nutrition" && (
            <NutritionView onOpenFoodLogger={handleOpenFoodLogger} />
          )}

          {(activeTab === "workout" || activeTab === "history") && (
            <WorkoutView
              onOpenHistory={() => setIsWorkoutHistoryOpen(true)}
              onOpenNewRoutine={() => setIsNewRoutineOpen(true)}
            />
          )}

          {activeTab === "progress" && (
            <ProgressView
              onOpenGoals={() => setIsGoalsOpen(true)}
              onOpenWeeklyReview={() => setIsWeeklyReviewOpen(true)}
            />
          )}

        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenQuickAdd={() => handleOpenFoodLogger("lunch", "camera")} />

      {/* Global Rest Timer Banner Overlay */}
      <RestTimerBanner />

      {/* Global Interactive Modals */}
      <FoodLoggerModal
        isOpen={isFoodLoggerOpen}
        onClose={() => setIsFoodLoggerOpen(false)}
        initialMealType={foodLoggerMealType}
        initialTab={foodLoggerInitialTab}
      />

      <ActiveWorkoutModal />

      <WorkoutHistoryModal
        isOpen={isWorkoutHistoryOpen}
        onClose={() => setIsWorkoutHistoryOpen(false)}
      />

      <NewRoutineModal
        isOpen={isNewRoutineOpen}
        onClose={() => setIsNewRoutineOpen(false)}
      />

      <GoalsModal
        isOpen={isGoalsOpen}
        onClose={() => setIsGoalsOpen(false)}
      />

      <WeeklyReviewModal
        isOpen={isWeeklyReviewOpen}
        onClose={() => setIsWeeklyReviewOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <StrengthToolsModal
        isOpen={isStrengthToolsOpen}
        onClose={() => setIsStrengthToolsOpen(false)}
      />

      <OnboardingModal />
    </div>
  );
};

export default function App() {
  return (
    <FitnessProvider>
      <MainAppContent />
    </FitnessProvider>
  );
}
