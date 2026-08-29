import React, { useState } from "react";
import {
  Dumbbell,
  Plus,
  Play,
  Award,
  History,
  TrendingUp,
  Sparkles,
  Zap,
  Filter,
  CheckCircle2,
  Clock,
  Flame,
} from "lucide-react";
import { useFitness } from "../context/FitnessContext";

interface WorkoutViewProps {
  onOpenHistory: () => void;
  onOpenNewRoutine: () => void;
}

export const WorkoutView: React.FC<WorkoutViewProps> = ({
  onOpenHistory,
  onOpenNewRoutine,
}) => {
  const {
    routines,
    startWorkout,
    startEmptyWorkout,
    activeWorkout,
    workouts,
    personalRecords,
    progressiveOverloadAdvice,
    userProfile,
  } = useFitness();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const completedWorkouts = workouts.filter((w) => w.completed);

  const categories = ["All", "Push", "Pull", "Legs", "Upper", "Lower", "Full Body"];

  const filteredRoutines = routines.filter(
    (r) => selectedCategory === "All" || r.category?.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* 1. Header Banner */}
      <div className="crono-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200/80 bg-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Strength & Hypertrophy</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Workouts & Routines
          </h1>
          <p className="text-xs text-gray-500">
            Execute programmed training routines, log working sets, and track progressive overload.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenHistory}
            id="btn-workout-view-history"
            className="px-3.5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-gray-700" />
            <span>History ({completedWorkouts.length})</span>
          </button>

          <button
            onClick={onOpenNewRoutine}
            id="btn-workout-view-new-routine"
            className="px-3.5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-gray-700" />
            <span>New Routine</span>
          </button>

          <button
            onClick={() => (activeWorkout ? startWorkout() : startEmptyWorkout())}
            id="btn-workout-quick-start"
            className="px-4 py-2 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{activeWorkout ? "Resume Session" : "Quick Start"}</span>
          </button>
        </div>
      </div>

      {/* 2. PROGRESSION ADVICE */}
      {progressiveOverloadAdvice.length > 0 && (
        <div className="crono-card p-5 sm:p-6 border border-gray-200/80 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">AI Progressive Overload Advice</h2>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Automated Micro-Progression
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {progressiveOverloadAdvice.map((advice, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gray-50/90 border border-gray-200 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{advice.exerciseName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                    {advice.type.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{advice.recommendation}</p>
                <div className="flex items-center gap-3 text-xs text-gray-900 font-bold pt-1">
                  {advice.suggestedWeight && (
                    <span className="text-blue-600">
                      Target: {advice.suggestedWeight} {userProfile.preferredUnits}
                    </span>
                  )}
                  {advice.suggestedReps && (
                    <span className="text-gray-700">
                      Reps: {advice.suggestedReps}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ROUTINES TEMPLATES & FILTERS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h2 className="text-base font-bold text-gray-900">Training Routines</h2>
            <span className="text-xs text-gray-500 font-medium">{filteredRoutines.length} saved templates</span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? "bg-gray-900 text-white shadow-xs"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoutines.map((routine) => (
            <div
              key={routine.id}
              className="crono-card p-5 flex flex-col justify-between space-y-4 border border-gray-200/80 bg-white hover:border-gray-300 transition-all shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {routine.category}
                  </span>
                  <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> ~{routine.estimatedDuration}m
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900">
                  {routine.name}
                </h3>

                <div className="space-y-1.5 pt-1">
                  {routine.exercises.slice(0, 3).map((ex, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-gray-600">
                      <span className="truncate pr-2 font-medium">• {ex.name}</span>
                      <span className="text-[11px] font-bold text-gray-900 shrink-0">
                        {ex.targetSets}×{ex.targetRepsRange}
                      </span>
                    </div>
                  ))}
                  {routine.exercises.length > 3 && (
                    <p className="text-[11px] text-gray-400 font-medium pt-0.5">
                      + {routine.exercises.length - 3} more exercises
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => startWorkout(routine)}
                className="w-full py-2.5 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Start Routine</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. PERSONAL RECORDS (PR) SHOWCASE */}
      <div className="crono-card p-5 sm:p-6 border border-gray-200/80 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Personal Records (PRs)
              </h3>
              <p className="text-xs text-gray-500">Peak working weights & estimated 1RMs</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
            All-Time Bests
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.keys(personalRecords).length > 0 ? (
            Object.entries(personalRecords).map(([name, pr], idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <p className="text-xs font-bold text-gray-900 truncate">{name}</p>
                <p className="text-lg font-bold text-gray-900">
                  {pr.weight} <span className="text-xs text-gray-500 font-normal">{userProfile.preferredUnits}</span>
                </p>
                <p className="text-[11px] text-gray-500 font-medium">
                  {pr.reps} reps · {pr.date}
                </p>
              </div>
            ))
          ) : (
            <>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <p className="text-xs font-bold text-gray-900">Barbell Bench Press</p>
                <p className="text-lg font-bold text-gray-900">
                  185 <span className="text-xs text-gray-500 font-normal">{userProfile.preferredUnits}</span>
                </p>
                <p className="text-[11px] text-gray-500">10 reps</p>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <p className="text-xs font-bold text-gray-900">Barbell Back Squat</p>
                <p className="text-lg font-bold text-gray-900">
                  245 <span className="text-xs text-gray-500 font-normal">{userProfile.preferredUnits}</span>
                </p>
                <p className="text-[11px] text-gray-500">8 reps</p>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <p className="text-xs font-bold text-gray-900">Deadlift (Conventional)</p>
                <p className="text-lg font-bold text-gray-900">
                  315 <span className="text-xs text-gray-500 font-normal">{userProfile.preferredUnits}</span>
                </p>
                <p className="text-[11px] text-gray-500">5 reps</p>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <p className="text-xs font-bold text-gray-900">Overhead Press</p>
                <p className="text-lg font-bold text-gray-900">
                  125 <span className="text-xs text-gray-500 font-normal">{userProfile.preferredUnits}</span>
                </p>
                <p className="text-[11px] text-gray-500">8 reps</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
