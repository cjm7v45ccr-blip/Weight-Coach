import React, { useState } from "react";
import { X, Plus, Dumbbell, Trash2, Check } from "lucide-react";
import { RoutineTemplate, Workout } from "../../types";
import { useFitness } from "../../context/FitnessContext";

interface NewRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewRoutineModal: React.FC<NewRoutineModalProps> = ({ isOpen, onClose }) => {
  const { addRoutine } = useFitness();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Workout["category"]>("Full Body");
  const [estimatedDuration, setEstimatedDuration] = useState(45);
  const [exercises, setExercises] = useState<
    Array<{
      name: string;
      muscleGroup: string;
      targetSets: number;
      targetRepsRange: string;
      defaultWeight: number;
    }>
  >([
    {
      name: "Barbell Bench Press",
      muscleGroup: "Chest",
      targetSets: 3,
      targetRepsRange: "8–10",
      defaultWeight: 135,
    },
    {
      name: "Lat Pulldown",
      muscleGroup: "Back",
      targetSets: 3,
      targetRepsRange: "10–12",
      defaultWeight: 120,
    },
  ]);

  if (!isOpen) return null;

  const handleAddExerciseRow = () => {
    setExercises((prev) => [
      ...prev,
      {
        name: "",
        muscleGroup: "Chest",
        targetSets: 3,
        targetRepsRange: "8–12",
        defaultWeight: 100,
      },
    ]);
  };

  const handleUpdateExerciseRow = (index: number, field: string, value: any) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveExerciseRow = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || exercises.length === 0) return;

    const newRoutine: RoutineTemplate = {
      id: "routine-" + Date.now(),
      name: name.trim(),
      category,
      description: `${category} workout session with ${exercises.length} movements.`,
      estimatedDuration: Number(estimatedDuration) || 45,
      exercises: exercises.map((ex, i) => ({
        exerciseId: "ex-custom-" + i + "-" + Date.now(),
        name: ex.name.trim() || "Exercise " + (i + 1),
        targetSets: Number(ex.targetSets) || 3,
        targetRepsRange: ex.targetRepsRange || "8–10",
        targetRestSeconds: 90,
        muscleGroup: ex.muscleGroup,
        defaultWeight: Number(ex.defaultWeight) || 100,
      })),
    };

    addRoutine(newRoutine);
    onClose();
    setName("");
  };

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
              <h2 className="text-base font-semibold text-[#ededed]">Create Custom Workout Routine</h2>
              <p className="text-xs text-white/40">Design your recurring split template</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-white/70 block mb-1">Routine Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Hypertrophy Pull Day"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] px-3.5 py-2 text-sm text-[#ededed] focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-white/70 block mb-1">Split Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Workout["category"])}
                className="w-full rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] px-3 py-2 text-sm text-[#ededed] focus:outline-none focus:border-blue-500/50"
              >
                <option value="Upper Body">Upper Body</option>
                <option value="Lower Body">Lower Body</option>
                <option value="Push">Push</option>
                <option value="Pull">Pull</option>
                <option value="Legs">Legs</option>
                <option value="Full Body">Full Body</option>
              </select>
            </div>
          </div>

          {/* Exercise Builder List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#ededed]">Exercises in Routine</label>
              <button
                type="button"
                onClick={handleAddExerciseRow}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Movement</span>
              </button>
            </div>

            <div className="space-y-2">
              {exercises.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      required
                      placeholder="Movement name"
                      value={ex.name}
                      onChange={(e) => handleUpdateExerciseRow(idx, "name", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-xs text-[#ededed] focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <select
                      value={ex.muscleGroup}
                      onChange={(e) => handleUpdateExerciseRow(idx, "muscleGroup", e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-xs text-[#ededed] focus:outline-none focus:border-blue-500/50"
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
                  <div className="sm:col-span-2 flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="Sets"
                      value={ex.targetSets}
                      onChange={(e) => handleUpdateExerciseRow(idx, "targetSets", e.target.value)}
                      className="w-12 px-2 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] text-xs font-mono text-[#ededed] text-center focus:outline-none focus:border-blue-500/50"
                    />
                    <span className="text-[11px] text-white/40 font-mono">sets</span>
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveExerciseRow(idx)}
                      className="p-1.5 text-white/30 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1a1a1a] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-white/50 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save Routine Template</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
