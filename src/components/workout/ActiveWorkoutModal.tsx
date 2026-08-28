import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Check,
  Timer,
  Award,
  ChevronDown,
  Dumbbell,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import { useFitness } from "../../context/FitnessContext";

export const ActiveWorkoutModal: React.FC = () => {
  const {
    activeWorkout,
    updateActiveSet,
    addSetToExercise,
    deleteSetFromExercise,
    addExerciseToActiveWorkout,
    removeExerciseFromActiveWorkout,
    finishActiveWorkout,
    cancelActiveWorkout,
    startRestTimer,
    userProfile,
    progressiveOverloadAdvice,
  } = useFitness();

  const [notes, setNotes] = useState("");
  const [rpe, setRpe] = useState(8);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExName, setNewExName] = useState("");
  const [newExMuscle, setNewExMuscle] = useState("Chest");
  const [newExSets, setNewExSets] = useState(3);
  const [newExWeight, setNewExWeight] = useState(135);

  if (!activeWorkout) return null;

  const handleToggleSetComplete = (
    exerciseIndex: number,
    setIndex: number,
    completed: boolean,
    exerciseName: string,
    restSeconds: number
  ) => {
    updateActiveSet(exerciseIndex, setIndex, { completed });
    if (completed) {
      startRestTimer(restSeconds || 90, exerciseName);
    }
  };

  const handleAddExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    addExerciseToActiveWorkout({
      name: newExName.trim(),
      muscleGroup: newExMuscle,
      targetSets: Number(newExSets) || 3,
      targetRepsRange: "8–10",
      defaultWeight: Number(newExWeight) || 100,
    });
    setNewExName("");
    setShowAddExercise(false);
  };

  // Calculate live volume
  let liveVolume = 0;
  let completedSetsCount = 0;
  let totalSetsCount = 0;

  activeWorkout.exercises.forEach((ex) => {
    ex.sets.forEach((s) => {
      totalSetsCount++;
      if (s.completed) {
        completedSetsCount++;
        liveVolume += s.weight * s.reps;
      }
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-lg animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] bg-[#0c0c0c]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25 animate-pulse">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#ededed]">{activeWorkout.name}</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  LIVE SESSION
                </span>
              </div>
              <p className="text-xs text-white/40 font-mono mt-0.5">
                {completedSetsCount} / {totalSetsCount} sets completed · {liveVolume.toLocaleString()} {userProfile.preferredUnits} volume
              </p>
            </div>
          </div>

          <button
            onClick={cancelActiveWorkout}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Minimize / Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Exercises Scroll Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeWorkout.exercises.map((exercise, exIdx) => {
            // Find progressive overload tip for this exercise if available
            const overloadTip = progressiveOverloadAdvice.find(
              (a) => a.exerciseName.toLowerCase() === exercise.name.toLowerCase()
            );

            return (
              <div
                key={exercise.id}
                className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] space-y-3"
              >
                {/* Exercise Title Bar */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#ededed]">{exercise.name}</h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-white/50">
                        {exercise.muscleGroup}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40 font-mono mt-0.5">
                      Target: {exercise.targetSets} sets × {exercise.targetRepsRange} reps · Rest {exercise.targetRestSeconds}s
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => removeExerciseFromActiveWorkout(exIdx)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 text-white/30 transition-colors"
                      title="Remove Exercise"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progressive Overload Tip Banner */}
                {overloadTip && (
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">{overloadTip.recommendation}</p>
                  </div>
                )}

                {/* Sets Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-white/40 border-b border-white/[0.04]">
                        <th className="pb-2 w-12">SET</th>
                        <th className="pb-2">WEIGHT ({userProfile.preferredUnits.toUpperCase()})</th>
                        <th className="pb-2">REPS</th>
                        <th className="pb-2 text-center w-16">DONE</th>
                        <th className="pb-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {exercise.sets.map((set, sIdx) => (
                        <tr
                          key={set.id}
                          className={`transition-colors ${
                            set.completed ? "bg-emerald-500/[0.04]" : "hover:bg-white/[0.01]"
                          }`}
                        >
                          <td className="py-2.5 font-bold text-white/60">
                            {set.setNumber}
                          </td>
                          <td className="py-2.5 pr-2">
                            <input
                              type="number"
                              value={set.weight}
                              onChange={(e) =>
                                updateActiveSet(exIdx, sIdx, {
                                  weight: Number(e.target.value) || 0,
                                })
                              }
                              className="w-20 px-2 py-1 rounded bg-white/[0.05] border border-white/[0.08] text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 pr-2">
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) =>
                                updateActiveSet(exIdx, sIdx, {
                                  reps: Number(e.target.value) || 0,
                                })
                              }
                              className="w-16 px-2 py-1 rounded bg-white/[0.05] border border-white/[0.08] text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleSetComplete(
                                  exIdx,
                                  sIdx,
                                  !set.completed,
                                  exercise.name,
                                  exercise.targetRestSeconds
                                )
                              }
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                                set.completed
                                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105"
                                  : "bg-white/[0.06] text-white/30 hover:bg-white/[0.1] hover:text-white"
                              }`}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => deleteSetFromExercise(exIdx, sIdx)}
                              className="p-1 text-white/20 hover:text-rose-400 transition-colors"
                              title="Delete set"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Set Button */}
                <button
                  type="button"
                  onClick={() => addSetToExercise(exIdx)}
                  className="w-full py-1.5 rounded-lg border border-dashed border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.02] text-white/50 hover:text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Set</span>
                </button>
              </div>
            );
          })}

          {/* Add Exercise Trigger / Modal */}
          {showAddExercise ? (
            <form onSubmit={handleAddExerciseSubmit} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.1] space-y-3 animate-fade-in">
              <h4 className="text-xs font-semibold text-white/90">Add Exercise to Session</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-mono text-white/40 block mb-1">Exercise Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Incline Dumbbell Curl"
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/40 block mb-1">Muscle Group</label>
                  <select
                    value={newExMuscle}
                    onChange={(e) => setNewExMuscle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#11131a] border border-white/[0.1] text-xs text-white"
                  >
                    <option value="Chest">Chest</option>
                    <option value="Back">Back</option>
                    <option value="Quads">Quads</option>
                    <option value="Hamstrings">Hamstrings</option>
                    <option value="Shoulders">Shoulders</option>
                    <option value="Arms">Arms</option>
                    <option value="Core">Core</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddExercise(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-xs text-white/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white"
                >
                  Add Exercise
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddExercise(true)}
              className="w-full py-3 rounded-xl border border-dashed border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.02] text-white/60 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Exercise</span>
            </button>
          )}

          {/* Post-Workout Assessment (Notes + RPE) */}
          <div className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] space-y-3">
            <h4 className="text-xs font-semibold text-[#ededed]">Session Debrief & RPE</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-white/40 block mb-1">
                  Rate of Perceived Exertion (RPE: 1-10)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max="10"
                    step="0.5"
                    value={rpe}
                    onChange={(e) => setRpe(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-white/[0.06]">
                    {rpe}
                  </span>
                </div>
                <p className="text-[10px] text-white/30 font-mono mt-1">
                  {rpe >= 9 ? "Near failure / high fatigue" : rpe >= 8 ? "2 reps in reserve (ideal hypertrophy)" : "Moderate intensity"}
                </p>
              </div>

              <div>
                <label className="text-[10px] font-mono text-white/40 block mb-1">Session Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Strong bench sets, left shoulder felt great"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#141414] border border-[#222222] text-xs text-[#ededed] focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Finish Actions */}
        <div className="px-6 py-4 border-t border-[#1a1a1a] bg-[#0c0c0c] flex items-center justify-between">
          <button
            type="button"
            onClick={cancelActiveWorkout}
            className="px-4 py-2 rounded-xl text-xs font-medium text-white/50 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            Discard Workout
          </button>

          <button
            type="button"
            onClick={() => finishActiveWorkout(notes, rpe)}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Finish & Record Workout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
