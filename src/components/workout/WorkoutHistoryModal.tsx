import React, { useState } from "react";
import { X, Dumbbell, Calendar, Flame, Trash2, Award, ChevronRight } from "lucide-react";
import { Workout } from "../../types";
import { useFitness } from "../../context/FitnessContext";

interface WorkoutHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkoutHistoryModal: React.FC<WorkoutHistoryModalProps> = ({ isOpen, onClose }) => {
  const { workouts, deleteWorkout, userProfile } = useFitness();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  if (!isOpen) return null;

  const completedWorkouts = workouts.filter((w) => w.completed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] bg-[#0c0c0c]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#ededed]">Workout History & Logbook</h2>
              <p className="text-xs text-white/40">{completedWorkouts.length} logged sessions with set logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {completedWorkouts.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <Dumbbell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No completed workouts yet. Start your first session!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] space-y-3 hover:border-[#2e2e2e] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#ededed]">{workout.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {workout.category}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 font-mono mt-0.5">
                        {workout.date} · {workout.durationMinutes} mins · {workout.exercises.length} movements
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {workout.totalVolume ? (
                        <span className="text-xs font-mono text-[#ededed]/70">
                          {workout.totalVolume.toLocaleString()} {userProfile.preferredUnits}
                        </span>
                      ) : null}
                      <button
                        onClick={() => deleteWorkout(workout.id)}
                        className="p-1 text-white/30 hover:text-rose-400 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Exercise summary list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#1a1a1a]">
                    {workout.exercises.map((ex, i) => (
                      <div key={i} className="text-xs bg-[#0a0a0a] p-2 rounded-lg border border-[#1a1a1a]">
                        <p className="font-medium text-[#ededed]/80">{ex.name}</p>
                        <div className="text-[11px] font-mono text-white/40 mt-1 flex flex-wrap gap-1">
                          {ex.sets.map((s, si) => (
                            <span key={si} className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[#ededed]/70">
                              {s.weight}×{s.reps}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {workout.notes && (
                    <p className="text-xs text-white/60 italic bg-[#0a0a0a] px-3 py-1.5 rounded-lg border border-[#1a1a1a]">
                      "{workout.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
