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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-gray-100 rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 bg-gray-50/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600 border border-amber-200/80 animate-pulse shrink-0">
              <Dumbbell className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-bold text-gray-900">{activeWorkout.name}</h2>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {completedSetsCount}/{totalSetsCount} sets · {liveVolume.toLocaleString()} {userProfile.preferredUnits}
              </p>
            </div>
          </div>

          <button
            onClick={cancelActiveWorkout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-200/60 transition-colors"
            title="Minimize / Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Exercises Scroll Container */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 bg-white">
          {activeWorkout.exercises.map((exercise, exIdx) => {
            // Find progressive overload tip for this exercise if available
            const overloadTip = progressiveOverloadAdvice.find(
              (a) => a.exerciseName.toLowerCase() === exercise.name.toLowerCase()
            );

            return (
              <div
                key={exercise.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-gray-50/90 border border-gray-200/80 space-y-3 shadow-xs"
              >
                {/* Exercise Title Bar */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900">{exercise.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                        {exercise.muscleGroup}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 font-mono mt-0.5">
                      Target: {exercise.targetSets} × {exercise.targetRepsRange} reps · Rest {exercise.targetRestSeconds}s
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => removeExerciseFromActiveWorkout(exIdx)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                      title="Remove Exercise"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progressive Overload Tip Banner */}
                {overloadTip && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed font-medium">{overloadTip.recommendation}</p>
                  </div>
                )}

                {/* Sets Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-200 text-[10px] uppercase">
                        <th className="pb-1.5 w-10 font-bold">SET</th>
                        <th className="pb-1.5 font-bold">LBS / KG</th>
                        <th className="pb-1.5 font-bold">REPS</th>
                        <th className="pb-1.5 text-center w-14 font-bold">DONE</th>
                        <th className="pb-1.5 w-7"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/60">
                      {exercise.sets.map((set, sIdx) => (
                        <tr
                          key={set.id}
                          className={`transition-colors ${
                            set.completed ? "bg-emerald-50/70" : "hover:bg-white"
                          }`}
                        >
                          <td className="py-2 font-bold text-gray-900">
                            {set.setNumber}
                          </td>
                          <td className="py-2 pr-1.5">
                            <input
                              type="number"
                              inputMode="decimal"
                              value={set.weight}
                              onChange={(e) =>
                                updateActiveSet(exIdx, sIdx, {
                                  weight: Number(e.target.value) || 0,
                                })
                              }
                              className="w-16 sm:w-20 px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-900 text-xs font-mono font-bold focus:border-indigo-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 pr-1.5">
                            <input
                              type="number"
                              inputMode="numeric"
                              value={set.reps}
                              onChange={(e) =>
                                updateActiveSet(exIdx, sIdx, {
                                  reps: Number(e.target.value) || 0,
                                })
                              }
                              className="w-14 sm:w-16 px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-900 text-xs font-mono font-bold focus:border-indigo-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 text-center">
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
                              className={`w-8 h-8 rounded-xl inline-flex items-center justify-center transition-all ${
                                set.completed
                                  ? "bg-emerald-600 text-white shadow-xs scale-105"
                                  : "bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 active:scale-95"
                              }`}
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </td>
                          <td className="py-2 text-right">
                            <button
                              type="button"
                              onClick={() => deleteSetFromExercise(exIdx, sIdx)}
                              className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                              title="Delete set"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
                  className="w-full py-1.5 rounded-lg border border-dashed border-gray-200 hover:border-gray-200 hover:bg-white text-gray-500 hover:text-gray-900 text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Set</span>
                </button>
              </div>
            );
          })}

          {/* Add Exercise Trigger / Modal */}
          {showAddExercise ? (
            <form onSubmit={handleAddExerciseSubmit} className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-3 animate-fade-in shadow-xs">
              <h4 className="text-xs font-bold text-gray-900">Add Exercise to Session</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Exercise Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Incline Dumbbell Curl"
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-gray-100 text-xs font-medium text-gray-900 focus:outline-none focus:border-gray-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">Muscle Group</label>
                  <select
                    value={newExMuscle}
                    onChange={(e) => setNewExMuscle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-gray-100 text-xs font-medium text-gray-900 focus:outline-none focus:border-gray-200"
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
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-100 text-xs font-bold text-gray-500 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white hover:bg-gray-200 text-xs font-bold text-white shadow-xs"
                >
                  Add Exercise
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddExercise(true)}
              className="w-full py-3 rounded-xl border border-dashed border-gray-200 hover:border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-900 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Exercise</span>
            </button>
          )}

          {/* Post-Workout Assessment (Notes + RPE) */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-3">
            <h4 className="text-xs font-bold text-gray-900">Session Debrief & RPE</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">
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
                    className="w-full accent-[#00C1D4]"
                  />
                  <span className="text-xs font-mono font-bold text-gray-900 px-2 py-0.5 rounded-lg bg-white border border-gray-100">
                    {rpe}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 font-mono mt-1">
                  {rpe >= 9 ? "Near failure / high fatigue" : rpe >= 8 ? "2 reps in reserve (ideal hypertrophy)" : "Moderate intensity"}
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">Session Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Strong bench sets, left shoulder felt great"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-gray-100 text-xs text-gray-900 focus:outline-none focus:border-gray-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Finish Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={cancelActiveWorkout}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
          >
            Discard Workout
          </button>

          <button
            type="button"
            onClick={() => finishActiveWorkout(notes, rpe)}
            className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-sm shadow-[#2EC47D]/25 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Finish & Record Workout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
