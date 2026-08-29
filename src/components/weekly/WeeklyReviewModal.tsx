import React, { useState } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RotateCw,
  Award,
  ArrowRight,
  Flame,
  Loader2,
} from "lucide-react";
import { useFitness } from "../../context/FitnessContext";

interface WeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({ isOpen, onClose }) => {
  const { latestWeeklyReview, generateWeeklyReview, userProfile } = useFitness();
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateWeeklyReview();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30/20 text-rose-500">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">Weekly Retrospective & Review</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/30/20">
                  AI INSIGHTS
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {latestWeeklyReview ? latestWeeklyReview.weekRange : "Current Period"}
              </p>
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
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-white">
          {/* Key Metric Scorecard */}
          {latestWeeklyReview && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Weight Delta</p>
                <p className="text-base font-bold font-mono text-gray-900 mt-0.5">
                  {latestWeeklyReview.avgWeightChange > 0 ? "+" : ""}
                  {latestWeeklyReview.avgWeightChange} {userProfile.preferredUnits}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Workouts Done</p>
                <p className="text-base font-bold font-mono text-gray-900 mt-0.5">
                  {latestWeeklyReview.completedWorkouts} / {latestWeeklyReview.targetWorkouts}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Protein Adherence</p>
                <p className="text-base font-bold font-mono text-blue-500 mt-0.5">
                  {latestWeeklyReview.proteinAdherencePercent}%
                </p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Calorie Target</p>
                <p className="text-base font-bold font-mono text-amber-600 mt-0.5">
                  {latestWeeklyReview.calorieAdherencePercent}%
                </p>
              </div>
            </div>
          )}

          {/* What Went Well */}
          {latestWeeklyReview && latestWeeklyReview.whatWentWell.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider">What Went Well</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-900">
                {latestWeeklyReview.whatWentWell.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500 shrink-0 mt-0.5 font-bold">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What Could Improve */}
          {latestWeeklyReview && latestWeeklyReview.whatCouldImprove.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Opportunities for Optimization</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-900">
                {latestWeeklyReview.whatCouldImprove.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-500 shrink-0 mt-0.5 font-bold">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Week Action Focus */}
          {latestWeeklyReview && latestWeeklyReview.nextWeekFocus.length > 0 && (
            <div className="p-4 rounded-xl bg-cyan-50/60 border border-cyan-200/80 space-y-2.5">
              <div className="flex items-center gap-2 text-cyan-800">
                <ArrowRight className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider">High Leverage Targets for Next Week</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-900">
                {latestWeeklyReview.nextWeekFocus.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 shrink-0 mt-0.5 font-bold">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-[11px] text-gray-500">
            Analyzed via Gemini AI Coach engine
          </p>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm shadow-[#FF6B4A]/25 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing Logs...</span>
              </>
            ) : (
              <>
                <RotateCw className="w-3.5 h-3.5" />
                <span>Re-Analyze Week</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
