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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 border border-amber-200 text-amber-500">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Workout History & Logbook</h2>
              <p className="text-xs text-gray-500">{completedWorkouts.length} logged sessions with set logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-white">
          {completedWorkouts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Dumbbell className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No completed workouts yet. Start your first session!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-3 hover:border-gray-200 transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">{workout.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-500 border border-amber-200">
                          {workout.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        {workout.date} · {workout.durationMinutes} mins · {workout.exercises.length} movements
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {workout.totalVolume ? (
                        <span className="text-xs font-mono font-bold text-gray-900">
                          {workout.totalVolume.toLocaleString()} {userProfile.preferredUnits}
                        </span>
                      ) : null}
                      <button
                        onClick={() => deleteWorkout(workout.id)}
                        className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Exercise summary list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    {workout.exercises.map((ex, i) => (
                      <div key={i} className="text-xs bg-white p-2.5 rounded-lg border border-gray-100">
                        <p className="font-semibold text-gray-900">{ex.name}</p>
                        <div className="text-[11px] font-mono text-gray-500 mt-1 flex flex-wrap gap-1">
                          {ex.sets.map((s, si) => (
                            <span key={si} className="px-1.5 py-0.5 rounded bg-gray-50 border border-gray-100 text-gray-900 font-medium">
                              {s.weight}×{s.reps}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {workout.notes && (
                    <p className="text-xs text-gray-500 italic bg-white px-3 py-1.5 rounded-lg border border-gray-100">
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
