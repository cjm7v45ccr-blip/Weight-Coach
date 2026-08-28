import React, { useState } from "react";
import {
  Dumbbell,
  Plus,
  Play,
  Award,
  History,
  TrendingUp,
  Flame,
  Zap,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { useFitness } from "../context/FitnessContext";
import { RoutineTemplate } from "../types";

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
    weeklyWorkoutConsistency,
    userProfile,
  } = useFitness();

  const completedWorkouts = workouts.filter((w) => w.completed);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* 1. HEADER & ACTION LAUNCHER */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Dumbbell className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-blue-300 font-semibold">
                TRAINING OS
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#ededed]">
              Workout & Progressive Overload Tracking
            </h1>
            <p className="text-xs sm:text-sm text-white/60">
              Track sets, reps, and RPE with automated weight progression recommendations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenHistory}
              id="btn-workout-view-history"
              className="px-4 py-2.5 rounded-xl bg-[#0f0f0f] hover:bg-[#161616] border border-[#1a1a1a] text-white/80 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-white/50" />
              <span>Logbook ({completedWorkouts.length})</span>
            </button>

            <button
              onClick={onOpenNewRoutine}
              id="btn-workout-view-new-routine"
              className="px-4 py-2.5 rounded-xl bg-[#0f0f0f] hover:bg-[#161616] border border-[#1a1a1a] text-white/80 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-white/50" />
              <span>New Routine</span>
            </button>

            <button
              onClick={() => (activeWorkout ? startWorkout() : startEmptyWorkout())}
              id="btn-workout-quick-start"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{activeWorkout ? "Resume Session" : "Quick Start"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. PROGRESSIVE OVERLOAD ENGINE INSIGHTS */}
      {progressiveOverloadAdvice.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-[#ededed]">Progressive Overload Guidance</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {progressiveOverloadAdvice.map((advice, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-2 hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#ededed]">{advice.exerciseName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 uppercase border border-blue-500/20">
                    {advice.type.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">{advice.recommendation}</p>
                <div className="flex items-center gap-3 text-[11px] font-mono text-white/40 pt-1">
                  {advice.suggestedWeight && (
                    <span>
                      Target Weight: <strong className="text-white/80">{advice.suggestedWeight} {userProfile.preferredUnits}</strong>
                    </span>
                  )}
                  {advice.suggestedReps && (
                    <span>
                      Target Reps: <strong className="text-white/80">{advice.suggestedReps}</strong>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. ROUTINES TEMPLATES LIBRARY */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#ededed]">Routine Splits & Programs</h2>
            <p className="text-xs text-white/40">Select a routine to launch an active logging session</p>
          </div>

          <span className="text-xs font-mono text-white/40">{routines.length} routines available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="p-5 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#2e2e2e] transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#0f0f0f] text-white/50 border border-[#1a1a1a]">
                    {routine.category}
                  </span>
                  <span className="text-xs font-mono text-white/40">~{routine.estimatedDuration} min</span>
                </div>

                <h3 className="text-sm font-bold text-[#ededed] group-hover:text-blue-400 transition-colors">
                  {routine.name}
                </h3>

                <div className="space-y-1 pt-1">
                  {routine.exercises.slice(0, 3).map((ex, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-white/50">
                      <span className="truncate pr-2">• {ex.name}</span>
                      <span className="font-mono text-[10px] text-white/30 shrink-0">
                        {ex.targetSets}×{ex.targetRepsRange}
                      </span>
                    </div>
                  ))}
                  {routine.exercises.length > 3 && (
                    <p className="text-[10px] font-mono text-white/30 pt-0.5">
                      + {routine.exercises.length - 3} more movements
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => startWorkout(routine)}
                className="w-full py-2 rounded-lg bg-[#0f0f0f] hover:bg-blue-600 hover:text-white text-white/80 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-[#1a1a1a]"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Start Routine</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PERSONAL RECORDS (PRs) */}
      <section className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f] space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#ededed]">
              Personal Records (PRs)
            </h3>
            <p className="text-[11px] text-white/40">Top weights recorded in your sessions</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.keys(personalRecords).length > 0 ? (
            Object.entries(personalRecords).map(([name, pr], idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                <p className="text-xs font-medium text-white/80 truncate">{name}</p>
                <p className="text-lg font-bold font-mono text-[#ededed] mt-1">
                  {pr.weight} <span className="text-xs text-white/40 font-normal">{userProfile.preferredUnits}</span>
                </p>
                <p className="text-[10px] font-mono text-white/40 mt-0.5">
                  {pr.reps} reps · {pr.date}
                </p>
              </div>
            ))
          ) : (
            <>
              <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                <p className="text-xs font-medium text-white/80">Barbell Bench Press</p>
                <p className="text-lg font-bold font-mono text-[#ededed] mt-1">
                  185 <span className="text-xs text-white/40 font-normal">{userProfile.preferredUnits}</span>
                </p>
                <p className="text-[10px] font-mono text-white/40 mt-0.5">10 reps</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                <p className="text-xs font-medium text-white/80">Barbell Back Squat</p>
                <p className="text-lg font-bold font-mono text-[#ededed] mt-1">
                  245 <span className="text-xs text-white/40 font-normal">{userProfile.preferredUnits}</span>
                </p>
                <p className="text-[10px] font-mono text-white/40 mt-0.5">8 reps</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                <p className="text-xs font-medium text-white/80">Conventional Deadlift</p>
                <p className="text-lg font-bold font-mono text-[#ededed] mt-1">
                  315 <span className="text-xs text-white/40 font-normal">{userProfile.preferredUnits}</span>
                </p>
                <p className="text-[10px] font-mono text-white/40 mt-0.5">5 reps</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                <p className="text-xs font-medium text-white/80">Overhead Press</p>
                <p className="text-lg font-bold font-mono text-[#ededed] mt-1">
                  125 <span className="text-xs text-white/40 font-normal">{userProfile.preferredUnits}</span>
                </p>
                <p className="text-[10px] font-mono text-white/40 mt-0.5">8 reps</p>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};
